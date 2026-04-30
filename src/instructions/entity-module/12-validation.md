# 12 Validation

## Objetivo
Definir la validacion final del modulo una vez implementado, con foco en un comportamiento funcional consistente para cualquier entidad.

## Dependencias
- El modulo ya fue implementado siguiendo los pasos anteriores.

## Validacion tecnica minima
1. Compila el frontend sin errores de imports.
2. La libreria exporta correctamente modulo, servicio, modelos y componentes.
3. El routing resuelve listado y apertura externa.
4. El modulo no rompe otras pantallas relacionadas.
5. La documentacion del modulo describe variables, metodos, Inputs y Outputs de forma consistente con el codigo.

## Validacion del listado
1. La pantalla principal navega correctamente.
2. El listado carga la primera pagina.
3. El filtro aplica parametros correctos.
4. El reset del filtro limpia la consulta.
5. La ordenacion reinicia pagina y cambia el orden esperado.
6. La carga de pagina siguiente agrega datos sin perder los anteriores.

## Validacion de acciones
1. La accion Nuevo abre una nueva tab interna.
2. Editar una entidad ya abierta no duplica tabs.
3. Abrir en nueva ventana usa la ruta `<entity-singular>/open`.
4. El borrado pide confirmacion antes de ejecutar.

## Validacion del formulario
1. Una entidad nueva puede guardarse.
2. Una entidad existente puede editarse.
3. `Save` solo se habilita cuando el formulario es valido y fue modificado.
4. `Cancel` sin cambios cierra sin modal.
5. `Cancel` con cambios muestra confirmacion.

## Validacion de seguridad
1. Los botones visibles respetan el rol actual.
2. Los campos ocultos respetan el rol actual.
3. Una entidad lockeada abre en modo readonly.
4. El cierre de lock se ejecuta al cancelar o cerrar cuando corresponde.

## Validacion de integracion
1. Los endpoints usados por el servicio responden con el contrato esperado.
2. La serializacion del filtro coincide con lo esperado por backend.
3. Las traducciones y literales resuelven textos visibles.
4. La configuracion de grilla por usuario no rompe el render inicial.

## Evidencia recomendada
- Captura de compilacion exitosa.
- Lista corta de pruebas manuales ejecutadas.
- Registro de errores conocidos que queden fuera del alcance del modulo.

## Archivos de referencia
- `<entity-plural>-container.component.ts`
- `<entity-singular>-grid.component.ts`
- `<entity-singular>-form.component.ts`
- `http-services/<entity-singular>.service.ts`

## Checklist de salida
- Existe una lista clara de pruebas funcionales y tecnicas.
- El flujo de listado, formulario, seguridad e integracion esta cubierto.
- Se puede validar el modulo sin improvisar casos de prueba.
- Los riesgos residuales quedan identificados al final de la implementacion.
- Los contratos documentados (estado, metodos, inputs/outputs, endpoints) coinciden con la implementacion real del modulo de referencia.