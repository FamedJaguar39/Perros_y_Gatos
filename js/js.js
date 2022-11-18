window.onload = function(){
    var video = document.getElementById("video");
    var streamActual = null;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var modelo = null;
    var red = null;
    var modo = "user";

    (async() => {
        console.log("Iniciando carga del modelo entrenado");
        red = await tf.loadLayersModel("js/model.json");
        console.log("Modelo cargado");
    })();
    
    function mostrarCamara(){
        var opciones = {
            audio: false,
            video: {
                width: 400,
                height: 400
            }
        }
    
        if(navigator.mediaDevices.getUserMedia)
            navigator.mediaDevices.getUserMedia(opciones)
            .then(function(stream){
               streamActual = stream;
               video.srcObject = streamActual;
               actualizarCamara();
               predecir();
            })
            .catch(function(err){
                alert("No se pudo utilizar la camara");
                console.log(err);
            });
        {        
        
        }   
    }
    function actualizarCamara(){
        ctx.drawImage(video, 0, 0, 400, 400, 0, 0, 400, 400);
        setTimeout(actualizarCamara, 20);
    }
    function cambiarCamara(){
        alert("Cambiando camara");
        if(streamActual){
            streamActual.getTracks().forEach(track => {
                track.stop();
            });
        }
        modo = modo == "user" ? "environment" : "user";
        var opciones = {
            audio: false,
            video: {
                facingMode: modo,
                width: 400,
                height: 400,
            }
        };
        navigator.mediaDevices.getUserMedia(opciones)
            .then(function(stream){
               streamActual = stream;
               video.srcObject = streamActual;
               
            })
            .catch(function(err){
                alert("No se pudo cambiar la camara");
                console.log(err);
            });  
    }
    function predecir(){
        //console.log("Listo para predecir imagenes");
        var imgData = ctx.getImageData(0,0,64,64);
        
        var tfImagen = tf.browser.fromPixels(imgData, 3);
        var smallImg  = tf.image.resizeBilinear(tfImagen, [64,64]);
        var resized = tf.cast(smallImg, 'float32');
        var imagen = tf.tensor4d(Array.from(resized.dataSync()), [1,64,64,3]);

        var respuesta = red.predict(imagen).dataSync();
        //console.log(respuesta[0]);
        if(respuesta[0] <= 0.5){
            document.getElementById("resultado").innerHTML = "Gato";
        }
        else{
            document.getElementById("resultado").innerHTML = "Perro";

        }
        setTimeout(predecir, 150);
    }
    var boton = document.getElementById("cambiar_camara");
    boton.addEventListener("click", cambiarCamara, false);
    mostrarCamara();
}