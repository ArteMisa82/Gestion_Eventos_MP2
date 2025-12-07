// Test file to verify imports
import * as controller from './controllers/requisitos.controller';

console.log('Controller exports:', Object.keys(controller));
console.log('crearRequisito:', typeof controller.crearRequisito);
console.log('obtenerRequisitosPorDetalle:', typeof controller.obtenerRequisitosPorDetalle);

// Try named import
import { crearRequisito } from './controllers/requisitos.controller';
console.log('\nNamed import crearRequisito:', typeof crearRequisito);
