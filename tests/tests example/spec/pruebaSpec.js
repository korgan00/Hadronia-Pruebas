describe("GRUPO DE PRUEBAS", function() {
  it("descripcion de prueba", function(){
	  var a = multiplicacion(5,4);
	  var b = 4*5;
	  expect(a).toBe(b); 
  });
  it("descripcion de prueba que falla", function(){
	  var a = multiplicacionf(5,4);
	  var b = 4*5;
	  expect(a).toBe(b); 
  });
});
