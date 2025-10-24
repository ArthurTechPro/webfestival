import React, { useState } from 'react';
import { Form, Button, Alert, Image, Dropdown, Spinner } from 'react-bootstrap';
import CardPremium from '../ui/CardPremium';
import { useComments } from '../../hooks/useCommunity';
import { useAuth } from '../../contexts/AuthContext';
import type { Comment } from '../../types/community';

interface CommentSectionProps {
  medioId: number;
  allowComments?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  medioId, 
  allowComments = true 
}) => {
  const { user } = useAuth();
  const { 
    comments, 
    loading, 
    error, 
    createComment, 
    deleteComment, 
    reportComment 
  } = useComments(medioId);
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      await createComment({
        medio_id: medioId,
        contenido: newComment.trim()
      });
      setNewComment('');
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    try {
      setActionLoading(commentId);
      await deleteComment(commentId);
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportComment = async (commentId: number, reason: string) => {
    try {
      setActionLoading(commentId);
      await reportComment(commentId, reason);
      alert('Comentario reportado. Será revisado por nuestro equipo.');
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setActionLoading(null);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  const canDeleteComment = (comment: Comment) => {
    return user && (
      user.id === comment.usuario_id || 
      user.role === 'ADMIN' || 
      user.role === 'CONTENT_ADMIN'
    );
  };

  const canReportComment = (comment: Comment) => {
    return user && user.id !== comment.usuario_id && !comment.reportado;
  };

  return (
    <CardPremium variant="glass" className="comment-section">
      <div className="card-header">
        <h5>💬 Comentarios ({comments.length})</h5>
      </div>

      <div className="card-body">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Formulario para nuevo comentario */}
        {allowComments && user && (
          <Form onSubmit={handleSubmitComment} className="mb-4">
            <div className="d-flex align-items-start gap-3">
              <Image
                src={user.picture_url || '/default-avatar.png'}
                alt={user.nombre}
                roundedCircle
                width={40}
                height={40}
              />
              
              <div className="flex-grow-1">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submitting}
                  maxLength={500}
                />
                
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">
                    {newComment.length}/500 caracteres
                  </small>
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Enviando...
                      </>
                    ) : (
                      'Comentar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}

        {!allowComments && (
          <Alert variant="info" className="mb-3">
            Los comentarios están deshabilitados para este contenido.
          </Alert>
        )}

        {!user && allowComments && (
          <Alert variant="warning" className="mb-3">
            <a href="/login">Inicia sesión</a> para poder comentar.
          </Alert>
        )}

        {/* Lista de comentarios */}
        {loading && comments.length === 0 ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <p className="mt-2 mb-0">Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>No hay comentarios aún</p>
            <small>Sé el primero en comentar</small>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item mb-3 p-3 bg-light rounded">
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-start gap-3 flex-grow-1">
                    <Image
                      src={comment.usuario.picture_url || '/default-avatar.png'}
                      alt={comment.usuario.nombre}
                      roundedCircle
                      width={32}
                      height={32}
                    />
                    
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong>{comment.usuario.nombre}</strong>
                        <small className="text-muted">
                          {formatTimeAgo(comment.fecha_comentario)}
                        </small>
                        {comment.reportado && (
                          <span className="badge bg-warning text-dark">
                            Reportado
                          </span>
                        )}
                      </div>
                      
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {comment.contenido}
                      </p>
                    </div>
                  </div>

                  {/* Menú de acciones */}
                  {(canDeleteComment(comment) || canReportComment(comment)) && (
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        size="sm"
                        className="text-muted border-0 p-1"
                        disabled={actionLoading === comment.id}
                      >
                        {actionLoading === comment.id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          '⋮'
                        )}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {canDeleteComment(comment) && (
                          <Dropdown.Item
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-danger"
                          >
                            🗑️ Eliminar
                          </Dropdown.Item>
                        )}
                        
                        {canReportComment(comment) && (
                          <>
                            <Dropdown.Item
                              onClick={() => handleReportComment(comment.id, 'spam')}
                            >
                              🚫 Reportar como spam
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleReportComment(comment.id, 'inappropriate')}
                            >
                              ⚠️ Contenido inapropiado
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleReportComment(comment.id, 'harassment')}
                            >
                              🛡️ Acoso o bullying
                            </Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardPremium>
  );
};