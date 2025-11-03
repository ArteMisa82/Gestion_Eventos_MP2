//se creo la carptea de aplicacion del usuario
export class UserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAll() {
    return await this.userRepository.findAll();
  }

  async getById(id) {
    return await this.userRepository.findById(id);
  }

  async create(userData) {
    return await this.userRepository.create(userData);
  }

  async update(id, userData) {
    return await this.userRepository.update(id, userData);
  }

  async delete(id) {
    return await this.userRepository.delete(id);
  }
}
//se agregaron los casos de uso del usuario