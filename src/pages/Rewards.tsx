import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Trophy, Clock, CheckCircle } from 'lucide-react';
import { 
  getUserRewards, 
  redeemReward, 
  getRewardLevels, 
  type UserReward, 
  type RewardLevel 
} from '@/services/rewardsService';
import { toast } from '@/hooks/use-toast';

const Rewards = () => {
  const { user } = useAuth();
  const [userReward, setUserReward] = useState<UserReward | null>(null);
  const [rewardLevels, setRewardLevels] = useState<RewardLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserRewards();
    }
  }, [user]);

  const loadUserRewards = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const reward = await getUserRewards(user.id);
      setUserReward(reward);
      setRewardLevels(getRewardLevels(reward));
    } catch (error) {
      console.error('Error loading rewards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas recompensas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (level: RewardLevel) => {
    if (!user?.id || !userReward) return;
    
    if (userReward.total_points < level.points) {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de ${level.points} pontos para resgatar esta recompensa.`,
        variant: "destructive",
      });
      return;
    }

    if (level.redeemed) {
      toast({
        title: "Já resgatado",
        description: "Você já resgatou esta recompensa.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRedeeming(level.key);
      const success = await redeemReward(user.id, level.key);
      
      if (success) {
        toast({
          title: "Recompensa resgatada!",
          description: `${level.title} foi resgatado com sucesso!`,
        });
        loadUserRewards(); // Reload to update UI
      } else {
        throw new Error('Falha ao resgatar');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resgatar a recompensa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const getProgressToNextLevel = () => {
    if (!userReward) return { current: 0, next: 25, progress: 0 };
    
    const points = userReward.total_points;
    
    if (points < 25) {
      return { current: points, next: 25, progress: (points / 25) * 100 };
    } else if (points < 65) {
      return { current: points, next: 65, progress: (points / 65) * 100 };
    } else if (points < 120) {
      return { current: points, next: 120, progress: (points / 120) * 100 };
    } else {
      return { current: points, next: 120, progress: 100 };
    }
  };

  const progressData = getProgressToNextLevel();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Gift className="h-8 w-8 text-primary" />
              Recompensas
            </h1>
            <p className="text-muted-foreground">
              Complete suas sessões e faça upload das fotos para ganhar pontos!
            </p>
          </div>

          {/* Points Overview */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Star className="h-6 w-6" style={{ color: '#5C9376' }} />
                {userReward?.total_points || 0} Pontos
              </CardTitle>
              <CardDescription>
                Seus pontos acumulados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progresso para próximo nível</span>
                  <span>{progressData.current}/{progressData.next} pontos</span>
                </div>
                <Progress value={progressData.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* How to Earn Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Como Ganhar Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">1 ponto por sessão completa</p>
                    <p className="text-sm text-muted-foreground">
                      Para ganhar o ponto, você deve marcar a sessão como concluída 
                      E fazer upload das fotos de progresso no mesmo dia.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Levels */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Níveis de Recompensa
            </h2>
            
            <div className="grid gap-4">
              {rewardLevels.map((level, index) => {
                const canRedeem = userReward && userReward.total_points >= level.points && !level.redeemed;
                const isRedeeming = redeeming === level.key;
                
                return (
                  <Card key={level.points} className={`relative overflow-hidden ${
                    level.redeemed ? 'bg-muted/50' : canRedeem ? 'border-primary' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {level.title}
                            {level.redeemed && (
                              <Badge variant="secondary" className="text-xs">
                                Resgatado
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{level.description}</CardDescription>
                          {(canRedeem || level.redeemed) && (
                            <div className="mt-2 p-2 bg-muted rounded-md">
                              <p className="text-xs text-muted-foreground mb-1">Código do cupom:</p>
                              <code className="text-sm font-mono bg-background px-2 py-1 rounded border">
                                {level.couponCode}
                              </code>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {level.points}
                          </div>
                          <div className="text-xs text-muted-foreground">pontos</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleRedeem(level)}
                        disabled={!canRedeem || isRedeeming || level.redeemed}
                        className="w-full"
                        variant={level.redeemed ? "secondary" : canRedeem ? "default" : "outline"}
                      >
                        {isRedeeming ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Resgatando...
                          </>
                        ) : level.redeemed ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resgatado
                          </>
                        ) : canRedeem ? (
                          'Resgatar Agora'
                        ) : (
                          `Precisa de ${level.points - (userReward?.total_points || 0)} pontos`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;