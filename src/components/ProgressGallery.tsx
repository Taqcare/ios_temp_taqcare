
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Upload, Calendar, Image, Trash2 } from 'lucide-react';
import { toast } from './ui/sonner';
import { format } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ProgressPhoto {
  id: string;
  url: string;
  date: Date;
  area?: string;
  storage_path?: string;
}

export interface ProgressGalleryRef {
  openAddPhotoDrawer: () => void;
}

const ProgressGallery = forwardRef<ProgressGalleryRef>((props, ref) => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  
  // Fetch user's photos on component mount
  useEffect(() => {
    if (user) {
      fetchUserPhotos();
    }
  }, [user]);

  const fetchUserPhotos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error('Erro ao buscar fotos');
        console.error('Error fetching photos:', error);
        return;
      }
      
      if (data) {
        const formattedPhotos: ProgressPhoto[] = data.map(photo => ({
          id: photo.id,
          url: photo.photo_url,
          date: new Date(photo.created_at),
          area: photo.title,
          storage_path: photo.storage_path
        }));
        
        setPhotos(formattedPhotos);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Erro ao carregar as fotos');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o upload da imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Verificar se o título foi preenchido
    if (!photoTitle.trim()) {
      toast.error('Por favor, preencha o título da foto');
      return;
    }
    
    // Verificar se o arquivo é uma imagem
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    setIsUploading(true);
    
    try {
      // Gerar um id único para o arquivo
      const fileId = uuidv4();
      const fileExt = file.name.split('.').pop();
      const fileName = `${fileId}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload do arquivo para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress_photos')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter a URL pública do arquivo
      const { data: urlData } = await supabase.storage
        .from('progress_photos')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // URL assinada válida por 1 ano
      
      if (!urlData?.signedUrl) {
        throw new Error('Erro ao gerar URL da imagem');
      }
      
      // Salvar os metadados da foto na tabela
      const { data: photoData, error: photoError } = await supabase
        .from('progress_photos')
        .insert([
          {
            user_id: user.id,
            photo_url: urlData.signedUrl,
            title: photoTitle.trim(),
            storage_path: filePath
          }
        ])
        .select()
        .single();
      
      if (photoError) {
        throw photoError;
      }
      
      // Adicionar a nova foto na lista local
      const newPhoto: ProgressPhoto = {
        id: photoData.id,
        url: urlData.signedUrl,
        date: new Date(photoData.created_at),
        area: photoData.title,
        storage_path: photoData.storage_path
      };
      
      setPhotos(prev => [newPhoto, ...prev]);
      toast.success('Foto adicionada com sucesso!');
      
      // Resetar o título e fechar o drawer
      setPhotoTitle('');
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar a imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Função para excluir uma foto
  const deletePhoto = async (photo: ProgressPhoto) => {
    if (!user || !photo.storage_path) return;
    
    try {
      // Deletar da tabela de metadados
      const { error: deleteMetaError } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photo.id);
      
      if (deleteMetaError) {
        throw deleteMetaError;
      }
      
      // Deletar o arquivo do storage
      const { error: deleteStorageError } = await supabase.storage
        .from('progress_photos')
        .remove([photo.storage_path]);
      
      if (deleteStorageError) {
        throw deleteStorageError;
      }
      
      // Atualizar a lista local
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      
      // Fechar o modal se a foto excluída estiver selecionada
      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null);
      }
      
      toast.success('Foto excluída com sucesso');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir a foto');
    }
  };

  // Função para iniciar o upload de imagem
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Função para visualizar a imagem em tamanho maior
  const viewPhoto = (photo: ProgressPhoto) => {
    setSelectedPhoto(photo);
  };

  // Função para fechar a visualização
  const closePhotoView = () => {
    setSelectedPhoto(null);
  };

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    openAddPhotoDrawer: () => {
      setDrawerOpen(true);
    }
  }));

  return (
    <div className="space-y-4">
      {/* Seção de upload */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-16 border-dashed border-2 flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Adicionar Nova Foto</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Adicionar Foto de Progresso</DrawerTitle>
            <DrawerDescription>
              Faça upload de uma foto para acompanhar seu progresso
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 flex flex-col items-center">
            {/* Input para o título da foto */}
            <div className="w-full max-w-sm mb-4">
              <label htmlFor="photo-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título / Área do corpo *
              </label>
              <input
                type="text"
                id="photo-title"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="Ex: Pernas, Axila, Rosto..."
                required
                className={`w-full px-3 py-2 bg-background text-foreground border border-input rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring ${!photoTitle.trim() ? 'border-input' : 'border-green-500'}`}
              />
            </div>
            
            <div 
              onClick={triggerFileInput}
              className={`w-full max-w-sm aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-100 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-gray-500">Enviando...</p>
                </div>
              ) : (
                <>
                  <Image className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Clique para selecionar uma imagem</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG ou GIF até 10MB</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <DrawerClose asChild>
              <Button variant="outline" className="mt-4" disabled={isUploading}>Cancelar</Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Modal para visualizar a foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={closePhotoView}>
          <div className="bg-card text-card-foreground rounded-lg p-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">{selectedPhoto.area}</h3>
                <p className="text-sm text-gray-500">
                  {format(selectedPhoto.date, 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deletePhoto(selectedPhoto)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={closePhotoView}>
                  Fechar
                </Button>
              </div>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <img 
                src={selectedPhoto.url} 
                alt="Foto de progresso" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Galeria de fotos */}
      {!isLoading && photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <TooltipProvider key={photo.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="aspect-square rounded-lg overflow-hidden relative cursor-pointer hover:shadow-md transition group"
                    onClick={() => viewPhoto(photo)}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Foto de progresso de ${format(photo.date, 'dd/MM/yyyy')}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{photo.area}</p>
                      <div className="flex items-center text-white text-xs gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(photo.date, 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{photo.area || 'Área não especificada'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      {/* Mensagem para quando não houver fotos */}
      {!isLoading && photos.length === 0 && (
        <div className="text-center py-8">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Nenhuma foto adicionada ainda.</p>
        </div>
      )}
    </div>
  );
});

ProgressGallery.displayName = 'ProgressGallery';

export default ProgressGallery;
