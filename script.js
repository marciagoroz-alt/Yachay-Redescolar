const URL_SCRIPT = 'https://script.google.com/macros/s/AKfycbwuGaYWvNxC-R0yurEvrUGIfe-KbotlQ5KxpBLrnIW77zBCY9nnd9cI1jdBb2uRBuQ6/exec';

async function cargarMateriales() {
    const contenedor = document.getElementById('contenedor-materiales');
    if (!contenedor) return;
    
    contenedor.innerHTML = '<p class="destacado">Conectando con la Red YACHAY...</p>';

    try {
        const respuesta = await fetch(URL_SCRIPT + '?action=leer');
        const materiales = await respuesta.json();
        contenedor.innerHTML = ''; 

        if (materiales.length === 0) {
            contenedor.innerHTML = '<p class="destacado">Aún no hay materiales aprobados. ¡Sé el primero!</p>';
            return;
        }

        materiales.forEach(item => {
            const card = document.createElement('div');
            card.className = 'tarjeta-material';
            
            // 1. Aseguramos que el contacto sea tratado como TEXTO
            const contactoTexto = String(item.contacto || "").trim();
            
            // 2. Extraer ID de imagen
            const idImagen = item.imagen.match(/[-\w]{25,}/);
            const urlImagenDirecta = idImagen ? `https://lh3.googleusercontent.com/u/0/d/${idImagen}` : '';
            
            // 3. Lógica de contacto mejorada
            let linkFinal = "#";
            let target = "_self";

            if (contactoTexto.includes('@')) {
                linkFinal = `mailto:${contactoTexto}`;
            } else if (contactoTexto.length > 5) {
                // Si parece un número, armamos link de WhatsApp
                const soloNumeros = contactoTexto.replace(/\D/g, '');
                linkFinal = `https://wa.me/${soloNumeros}`;
                target = "_blank";
            }

            card.innerHTML = `
                <div style="width:100%; height:200px; overflow:hidden; border-radius:8px; background:#f0f0f0;">
                    <img src="${urlImagenDirecta}" alt="${item.titulo}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/300x200?text=Yachay'">
                </div>
                <div class="info" style="padding:15px 0;">
                    <h3 style="margin:0;">${item.titulo}</h3>
                    <span class="categoria-tag" style="background:#eee; padding:2px 5px; font-size:0.8em; border-radius:3px;">${item.categoria}</span>
                    <p style="margin:10px 0; font-size:0.9em; color:#444;">${item.descripcion}</p>
                    <p style="font-weight:bold; color:#b23a48; font-size:1.1em;">${item.precio == 0 ? '¡GRATIS!' : '$' + item.precio}</p>
                    <div style="margin-top:15px;">
                        <a href="${linkFinal}" target="${target}" class="boton" style="display:block; text-align:center; padding:10px; background:#b23a48; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">Contactar</a>
                        <a href="https://www.instagram.com/yachay.li/" target="_blank" style="display:block; margin-top:12px; font-size:0.75em; color:#888; text-align:center; text-decoration:none;">¿Se vendió? Avisanos (ID: ${item.id})</a>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        contenedor.innerHTML = '<p class="destacado">Error de conexión. Intentá recargar con F5.</p>';
        console.error("Error detallado:", error);
    }
}

// Función para el buscador
function filtrarMateriales() {
    const texto = document.getElementById('inputBusqueda').value.toLowerCase();
    const tarjetas = document.querySelectorAll('.tarjeta-material');
    let visibles = 0;

    tarjetas.forEach(tarjeta => {
        const contenido = tarjeta.innerText.toLowerCase();
        if (contenido.includes(texto)) {
            tarjeta.style.display = "block";
            visibles++;
        } else {
            tarjeta.style.display = "none";
        }
    });

    const conteo = document.getElementById('resultados-conteo');
    if (conteo) {
        conteo.innerText = texto === "" ? "Mostrando todo el catálogo" : `Se encontraron ${visibles} resultados`;
    }
}

document.addEventListener('DOMContentLoaded', cargarMateriales);