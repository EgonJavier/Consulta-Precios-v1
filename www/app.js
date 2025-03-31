document.addEventListener('DOMContentLoaded', () => {
    // Pantalla de bienvenida (Splash Screen)
    const splash = document.getElementById('splash');
    const appContainer = document.getElementById('app');

    // Mostrar el splash durante 2 segundos y luego iniciar la app
    setTimeout(() => {
        splash.classList.add('hidden');  // Oculta el splash
        appContainer.classList.remove('hidden');  // Muestra la app
    }, 2000);

     // URL de la API de Google Sheets
     const sheetID = '12u_a3D6SpjmtcpYUkiiDK_g9raWe9SN4OE33vTLB_f0';
const apiKey = 'AIzaSyCaWrV-a3kFirwCfTYzevHP_KqcQ2WXgPM';
const sheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Hoja1!A:G?key=${apiKey}`;
 
     let products = {};
     loadProducts();

     // Función para cargar productos desde Google Sheets
     async function loadProducts() {
        try {
            const response = await fetch(sheetURL);
            const data = await response.json();
            
            // Loguea la respuesta completa para verificar su estructura
            console.log("Respuesta de Google Sheets:", JSON.stringify(data, null, 2));
    
            if (data.values && Array.isArray(data.values)) {
                const rows = data.values;
    
                rows.slice(1).forEach(row => {
                    const [code, name, price, price2, interno, stock, fecha] = row;
                    products[code] = {
                        name,
                        price,
                        price2,
                        interno,
                        stock,
                        fecha
                    };
                });
                console.log("Productos cargados:", products);
            } else {
                console.error("Error: La respuesta no contiene datos en el formato esperado.");
            }
        } catch (error) {
            console.error("Error al cargar productos desde Google Sheets:", error);
            alert("No se pudieron cargar los productos. Revisa la consola para más detalles.");
        }
    }
 

    // Función para buscar el producto por código
    function lookupProduct(code) {
        return products[code] || null;
    }
    

    // Función para mostrar los detalles del producto en el popup
    function showProductPopup(product) {
            const popup = document.getElementById('productPopup');
            const popupName = document.getElementById('popupProductName');
            const popupPrice = document.getElementById('popupProductPrice');
            const popupPrice2 = document.getElementById('popupProductPrice2');
            const popupInterno = document.getElementById('popupProductInterno');
            const popupStock = document.getElementById('popupProductStock');
            const popupFecha = document.getElementById('popupProductFecha');

        
            // Asignar los valores del producto al popup
             popupName.textContent = product.name;
             popupPrice.textContent = product.price;
             popupPrice2.textContent = "Factura: " + product.price2;
             popupInterno.textContent = product.interno || '';
             popupStock.textContent = product.stock || '';
             popupFecha.textContent = product.fecha || '';

             // Limpiar estilos anteriores para evitar que se solapen estilos de otros productos
             popup.style.backgroundColor = ''; 
             popupPrice.style.color = ''; 
             popupPrice.style.fontSize = '';
             popupPrice.classList.remove('price-animation'); // Eliminar animación si existiera

        if(product.price === product.price2){
        // Estilos específicos para productos de tipo 1
        popup.style.backgroundColor = '#ffeb3b'; // Color de fondo
        popupPrice.style.color = '#d32f2f'; // Color del texto del precio
        popupPrice.style.fontSize = '1.5em'; // Tamaño de la fuente

        // Añadir una animación de precio si es tipo 1
        popupPrice.classList.add('price-animation');
       
        popupPrice2.classList.add('hidden');

       // Mostrar el popup y difuminar el fondo
       popup.classList.remove('hidden');
       popup.classList.add('visible');

       
       
       
    }else{
       // Cuando el producto es de tipo 1
       popup.classList.remove('hidden');
       popup.classList.add('visible');
       popupPrice2.classList.remove('hidden'); 
    }
   
    // Ocultar el popup al hacer clic en cualquier parte del popup
    document.getElementById('productPopup').addEventListener('click', () => {
        const popup = document.getElementById('productPopup');
        const container = document.querySelector('.container');

        popup.classList.remove('visible');
        popup.classList.add('hidden');
        container.classList.remove('blurred');
    });

    // Manejo del botón de búsqueda manual
    document.getElementById('lookupButton').addEventListener('click', () => {
        const barcode = document.getElementById('barcodeInput').value.trim();
        const product = lookupProduct(barcode);
    
        if (product) {
            showProductPopup(product);
        } else {
            alert("Producto no encontrado.");
        }
    });

    // Función para solicitar permisos de cámara
    async function requestCameraPermission() {
        try {
            // Intentar obtener acceso a la cámara para verificar permisos
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Si se obtiene el stream, los permisos están concedidos
            // Detener el stream inmediatamente ya que QuaggaJS lo manejará
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (err) {
            console.error("Permiso de cámara denegado:", err);
            alert("No se ha concedido permiso para usar la cámara.");
            return false;
        }
    }

    // Función para iniciar QuaggaJS y comenzar el escaneo
    async function startScanner() {
        // Verificar y solicitar permisos
        const allowed = await requestCameraPermission();
        if (!allowed) {
            return;
        }

        // Mostrar el contenedor del escáner
      


        // Inicializar QuaggaJS
        Quagga.init({
            inputStream: {
                type: "LiveStream",
                target: scanner, // Elemento donde QuaggaJS renderiza el video
                constraints: {
                    facingMode: "environment", // Cámara trasera
                    aspectRatio: { ideal: 1.7777777778 } // 16:9 para pantallas de móviles modernos
                },
            },
            decoder: {
                readers: ["ean_reader", "code_128_reader", "upc_reader", "code_39_reader"]
            }
        }, function (err) {
            if (err) {
                console.error("Error al inicializar QuaggaJS:", err);
                alert("Error al inicializar el escáner. Revisa la consola para más detalles.");
                return;
            }
            console.log("QuaggaJS iniciado correctamente.");
            Quagga.start();
             // Ocultar la pantalla de carga y mostrar el escáner
        loadingScreen.classList.add('hidden'); // Ocultar pantalla de carga
        scanner.classList.remove('hidden');
        });

        // Detección del código de barras
        Quagga.onDetected((result) => {
            if (result.codeResult && result.codeResult.code) {
                const barcode = result.codeResult.code;
                console.log("Código detectado:", barcode);

                // Buscar producto
                const product = lookupProduct(barcode);
                
                if (product) {
                    showProductPopup(product);

                    // Detener el escáner después de una detección exitosa
                    Quagga.stop();
                    scanner.classList.add('hidden');
                }
                // Si el producto no se encuentra, no hacemos nada y continuamos escaneando
            }
        });

        // Manejar errores durante el procesamiento
        Quagga.onProcessed((result) => {
            if (result) {
                
            }
        });
    }

    const loadingScreen = document.querySelector('.loading');
    const scanner = document.getElementById('scanner');

    // Botón "Usar Cámara"
    document.getElementById('startScanner').addEventListener('click', () => {
        loadingScreen.classList.remove('hidden'); // Mostrar la pantalla de carga
        startScanner();

    });

    // Botón "Cerrar" del escáner
    document.getElementById('closeScanner').addEventListener('click', () => {
        Quagga.stop(); // Detiene el escáner
        scanner.classList.add('hidden'); // Oculta el contenedor del escáner
    });

    // Abrir automáticamente el teclado numérico al enfocarse en el input
    const barcodeInput = document.getElementById('barcodeInput');
    barcodeInput.addEventListener( () => {
        barcodeInput.type = 'number';
    });
}});
