import React, { useState, useRef } from 'react';
import { Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import CardPremium from '../ui/CardPremium';
import { useProfile } from '../../hooks/useProfile';
import type { UpdateProfileData } from '../../types/community';

interface ProfileEditorProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ onSave, onCancel }) => {
  const { profile, updateProfile, uploadProfilePicture, loading, error } = useProfile();
  const [formData, setFormData] = useState<UpdateProfileData>({
    nombre: profile?.nombre || '',
    bio: profile?.bio || ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const pictureUrl = await uploadProfilePicture(file);
      setFormData(prev => ({
        ...prev,
        picture_url: pictureUrl
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      onSave?.();
    } catch (err) {
      // Error ya manejado por el hook
    }
  };

  const handleCancel = () => {
    // Resetear formulario
    setFormData({
      nombre: profile?.nombre || '',
      bio: profile?.bio || ''
    });
    onCancel?.();
  };

  if (loading && !profile) {
    return (
      <CardPremium variant="glass">
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-2">Cargando perfil...</p>
        </div>
      </CardPremium>
    );
  }

  return (
    <CardPremium variant="glass" className="profile-editor">
      <div className="card-header">
        <h4>Editar Perfil</h4>
      </div>
      
      <div className="card-body">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {uploadError && (
          <Alert variant="warning" className="mb-3">
            {uploadError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Foto de perfil */}
          <div className="text-center mb-4">
            <div className="profile-picture-container position-relative d-inline-block">
              <Image
                src={formData.picture_url || profile?.picture_url || '/default-avatar.png'}
                alt="Foto de perfil"
                roundedCircle
                width={120}
                height={120}
                className="border border-3 border-light shadow"
              />
              
              <Button
                variant="primary"
                size="sm"
                className="position-absolute bottom-0 end-0 rounded-circle"
                style={{ width: '32px', height: '32px' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  '📷'
                )}
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            
            <p className="text-muted small mt-2">
              Haz clic en el ícono para cambiar tu foto de perfil
            </p>
          </div>

          {/* Nombre */}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              required
            />
          </Form.Group>

          {/* Biografía */}
          <Form.Group className="mb-4">
            <Form.Label>Biografía</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Cuéntanos sobre ti, tu experiencia y tus intereses..."
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {formData.bio?.length || 0}/500 caracteres
            </Form.Text>
          </Form.Group>

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="outline-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={loading || uploading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </Form>
      </div>
    </CardPremium>
  );
};