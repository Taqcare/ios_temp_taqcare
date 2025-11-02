import { supabase } from '@/integrations/supabase/client';

export interface UserReward {
  id: string;
  user_id: string;
  total_points: number;
  redeemed_25_points: boolean;
  redeemed_65_points: boolean;
  redeemed_120_points: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardLevel {
  points: number;
  title: string;
  description: string;
  couponCode: string;
  redeemed: boolean;
  key: 'redeemed_25_points' | 'redeemed_65_points' | 'redeemed_120_points';
}

/**
 * Calculate user points based on completed sessions with uploaded photos
 */
export const calculateUserPoints = async (userId: string): Promise<number> => {
  try {
    // Get all completed sessions
    const { data: completedSessions, error: sessionsError } = await supabase
      .from('treatment_sessions')
      .select('session_date')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('session_date', { ascending: true });

    if (sessionsError) throw sessionsError;
    if (!completedSessions || completedSessions.length === 0) return 0;

    // Get all user photos
    const { data: photos, error: photosError } = await supabase
      .from('progress_photos')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (photosError) throw photosError;
    if (!photos || photos.length === 0) return 0;

    // Count sessions that have both completion and photos on the same day
    let points = 0;
    
    for (const session of completedSessions) {
      const sessionDate = new Date(session.session_date);
      const sessionDateString = sessionDate.toISOString().split('T')[0];
      
      // Check if there's at least one photo uploaded on the same day as the session
      const hasPhotoOnSameDay = photos.some(photo => {
        const photoDate = new Date(photo.created_at);
        const photoDateString = photoDate.toISOString().split('T')[0];
        return photoDateString === sessionDateString;
      });
      
      if (hasPhotoOnSameDay) {
        points++;
      }
    }
    
    return points;
  } catch (error) {
    console.error('Error calculating user points:', error);
    return 0;
  }
};

/**
 * Get or create user rewards record
 */
export const getUserRewards = async (userId: string): Promise<UserReward | null> => {
  try {
    // First try to get existing record
    const { data: existingReward, error: selectError } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingReward) {
      // Update the points based on current calculation
      const calculatedPoints = await calculateUserPoints(userId);
      
      if (calculatedPoints !== existingReward.total_points) {
        const { data: updatedReward, error: updateError } = await supabase
          .from('user_rewards')
          .update({ total_points: calculatedPoints })
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedReward;
      }
      
      return existingReward;
    }

    // Create new record if it doesn't exist
    const calculatedPoints = await calculateUserPoints(userId);
    const { data: newReward, error: insertError } = await supabase
      .from('user_rewards')
      .insert({
        user_id: userId,
        total_points: calculatedPoints,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newReward;
  } catch (error) {
    console.error('Error getting user rewards:', error);
    return null;
  }
};

/**
 * Redeem rewards for specific point level
 */
export const redeemReward = async (
  userId: string, 
  level: 'redeemed_25_points' | 'redeemed_65_points' | 'redeemed_120_points'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_rewards')
      .update({ [level]: true })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return false;
  }
};

/**
 * Get reward levels configuration
 */
export const getRewardLevels = (userReward: UserReward | null): RewardLevel[] => {
  return [
    {
      points: 25,
      title: 'Crédito Básico',
      description: 'R$ 30 de desconto na loja',
      couponCode: 'APPBASICO35',
      redeemed: userReward?.redeemed_25_points || false,
      key: 'redeemed_25_points'
    },
    {
      points: 65,
      title: 'Crédito Premium',
      description: 'R$ 75 de desconto na loja',
      couponCode: 'APPPREMIUM75',
      redeemed: userReward?.redeemed_65_points || false,
      key: 'redeemed_65_points'
    },
    {
      points: 120,
      title: 'Crédito VIP',
      description: 'R$ 120 de desconto na loja',
      couponCode: 'APPVIP120',
      redeemed: userReward?.redeemed_120_points || false,
      key: 'redeemed_120_points'
    }
  ];
};