//se creo la carptea dominio
export class User {
  constructor({ id, name, email, password, role, profileImage, activeCourses, completedCourses }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.profileImage = profileImage;
    this.activeCourses = activeCourses || [];
    this.completedCourses = completedCourses || [];
  }
}
//Se creo los datos del user para el aplicativo