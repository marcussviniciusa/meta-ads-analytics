import api from './api';

/**
 * Serviço para gerenciamento de usuários
 */
class UserService {
  /**
   * Obter lista de todos os usuários (apenas super admin)
   * @param {Object} params - Parâmetros de consulta (page, limit, search)
   * @returns {Promise} - Promise com os dados dos usuários
   */
  static async getUsers(params = {}) {
    const { page = 1, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    
    const queryString = queryParams.toString();
    const url = `/auth/users${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  }

  /**
   * Obter usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Promise} - Promise com os dados do usuário
   */
  static async getUserById(id) {
    return api.get(`/auth/users/${id}`);
  }

  /**
   * Criar novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise} - Promise com os dados do usuário criado
   */
  static async createUser(userData) {
    return api.post('/auth/register', userData);
  }

  /**
   * Atualizar usuário
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise} - Promise com os dados do usuário atualizado
   */
  static async updateUser(id, userData) {
    return api.put(`/auth/users/${id}`, userData);
  }

  /**
   * Excluir usuário
   * @param {number} id - ID do usuário
   * @returns {Promise} - Promise com resultado da exclusão
   */
  static async deleteUser(id) {
    return api.delete(`/auth/users/${id}`);
  }
}

export default UserService;
