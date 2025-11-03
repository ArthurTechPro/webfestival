import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  Alert,
  Spinner,
  ButtonGroup,
  InputGroup,
  Pagination,
  Dropdown
} from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import type { User } from '../../types';
import type { UserFilters } from '../../services/admin.service';

/**
 * Componente para gestión completa de usuarios y roles
 */
const UserManagement: React.FC = () => {
  const {
    users,
    loadUsers,
    updateUserRole,
    toggleUserStatus,
    loading,
    error,
    setError
  } = useAdmin();

  // Estados locales para filtros
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    role: '',
    search: ''
  });

  // Cargar usuarios al montar y cuando cambien los filtros
  useEffect(() => {
    loadUsers(filters);
  }, [loadUsers, filters]);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Manejar búsqueda
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  // Manejar filtro por rol
  const handleRoleFilter = (role: string) => {
    setFilters(prev => ({ ...prev, role, page: 1 }));
  };

  // Cambiar rol de usuario
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (window.confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`)) {
      try {
        await updateUserRole(userId, newRole);
      } catch (err) {
        // Error ya manejado en el hook
      }
    }
  };

  // Alternar estado del usuario
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${action} este usuario?`)) {
      try {
        await toggleUserStatus(userId);
      } catch (err) {
        // Error ya manejado en el hook
      }
    }
  };

  // Obtener color del badge según rol
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'JURADO': return 'warning';
      case 'CONTENT_ADMIN': return 'info';
      case 'PARTICIPANTE': return 'success';
      default: return 'secondary';
    }
  };

  // Obtener texto del rol en español
  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'JURADO': return 'Jurado';
      case 'CONTENT_ADMIN': return 'Admin Contenido';
      case 'PARTICIPANTE': return 'Participante';
      default: return role;
    }
  };

  // Generar items de paginación
  const renderPaginationItems = () => {
    const items = [];
    const totalPages = users.totalPages;
    const currentPage = users.page;

    // Botón anterior
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      />
    );

    // Páginas
    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 2 && page <= currentPage + 2)
      ) {
        items.push(
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        );
      } else if (
        page === currentPage - 3 ||
        page === currentPage + 3
      ) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} />);
      }
    }

    // Botón siguiente
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    );

    return items;
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-white mb-1">Gestión de Usuarios</h2>
              <p className="text-light mb-0">Administra usuarios, roles y permisos</p>
            </div>
            <Badge bg="info" className="fs-6">
              {users.total} usuarios registrados
            </Badge>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros y Búsqueda */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Buscar Usuario</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="bg-secondary text-white border-0"
                      />
                      <Button variant="outline-danger">
                        🔍
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Filtrar por Rol</Form.Label>
                    <Form.Select
                      value={filters.role}
                      onChange={(e) => handleRoleFilter(e.target.value)}
                      className="bg-secondary text-white border-0"
                    >
                      <option value="">Todos los roles</option>
                      <option value="PARTICIPANTE">Participantes</option>
                      <option value="JURADO">Jurados</option>
                      <option value="CONTENT_ADMIN">Admin Contenido</option>
                      <option value="ADMIN">Administradores</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Usuarios por página</Form.Label>
                    <Form.Select
                      value={filters.limit}
                      onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                      className="bg-secondary text-white border-0"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Usuarios */}
      <Row>
        <Col>
          <Card className="bg-dark text-white border-0">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Lista de Usuarios ({users.total})
                </h5>
                <small className="text-muted">
                  Página {users.page} de {users.totalPages}
                </small>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="light" />
                  <p className="mt-2 text-light">Cargando usuarios...</p>
                </div>
              ) : users.data.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-light">No se encontraron usuarios</p>
                </div>
              ) : (
                <>
                  <Table variant="dark" className="mb-0">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Registro</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.data.map((user: User) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {user.picture_url ? (
                                <img
                                  src={user.picture_url}
                                  alt={user.nombre}
                                  className="rounded-circle me-2"
                                  width="32"
                                  height="32"
                                />
                              ) : (
                                <div className="bg-secondary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                  👤
                                </div>
                              )}
                              <div>
                                <strong>{user.nombre}</strong>
                                {user.bio && (
                                  <>
                                    <br />
                                    <small className="text-muted">
                                      {user.bio.substring(0, 30)}...
                                    </small>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <Badge bg={getRoleBadgeVariant(user.role)}>
                              {getRoleText(user.role)}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={user.activo ? 'success' : 'danger'}>
                              {user.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <ButtonGroup size="sm">
                              {/* Cambiar Rol */}
                              <Dropdown>
                                <Dropdown.Toggle 
                                  variant="outline-warning" 
                                  size="sm"
                                  id={`dropdown-role-${user.id}`}
                                >
                                  👤
                                </Dropdown.Toggle>
                                <Dropdown.Menu variant="dark">
                                  <Dropdown.Header>Cambiar Rol</Dropdown.Header>
                                  <Dropdown.Item 
                                    onClick={() => handleRoleChange(user.id, 'PARTICIPANTE')}
                                    disabled={user.role === 'PARTICIPANTE'}
                                  >
                                    Participante
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleRoleChange(user.id, 'JURADO')}
                                    disabled={user.role === 'JURADO'}
                                  >
                                    Jurado
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleRoleChange(user.id, 'CONTENT_ADMIN')}
                                    disabled={user.role === 'CONTENT_ADMIN'}
                                  >
                                    Admin Contenido
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleRoleChange(user.id, 'ADMIN')}
                                    disabled={user.role === 'ADMIN'}
                                  >
                                    Administrador
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>

                              {/* Alternar Estado */}
                              <Button
                                variant={user.activo ? 'outline-danger' : 'outline-success'}
                                onClick={() => handleToggleStatus(user.id, user.activo)}
                                title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                {user.activo ? '🚫' : '✅'}
                              </Button>

                              {/* Ver Perfil */}
                              <Button
                                variant="outline-info"
                                onClick={() => window.open(`/profile/${user.id}`, '_blank')}
                                title="Ver perfil"
                              >
                                👁️
                              </Button>
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Paginación */}
                  {users.totalPages > 1 && (
                    <div className="d-flex justify-content-center p-3">
                      <Pagination className="mb-0">
                        {renderPaginationItems()}
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas Rápidas */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="bg-secondary text-white border-0">
            <Card.Body className="text-center">
              <h4>{users.data.filter(u => u.role === 'PARTICIPANTE').length}</h4>
              <small>Participantes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-secondary text-white border-0">
            <Card.Body className="text-center">
              <h4>{users.data.filter(u => u.role === 'JURADO').length}</h4>
              <small>Jurados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-secondary text-white border-0">
            <Card.Body className="text-center">
              <h4>{users.data.filter(u => u.role === 'CONTENT_ADMIN').length}</h4>
              <small>Admin Contenido</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-secondary text-white border-0">
            <Card.Body className="text-center">
              <h4>{users.data.filter(u => u.role === 'ADMIN').length}</h4>
              <small>Administradores</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserManagement;