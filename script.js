const URL_SCRIPT = 'https://script.google.com/macros/s/AKfycbwuGaYWvNxC-R0yurEvrUGIfe-KbotlQ5KxpBLrnIW77zBCY9nnd9cI1jdBb2uRBuQ6/exec';

async function cargarMateriales() {
    const contenedor = document.getElementById('contenedor-materiales');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
            <div class="spinner"></div>
            <p class="destacado">Conectando con la Red YACHAY...</p>
        </div>`;

    try {
        const respuesta = await fetch(URL_SCRIPT + '?action=leer');
        const materiales = await respuesta.json();
        contenedor.innerHTML = '';

        if (materiales.length === 0) {
            contenedor.innerHTML = '<p class="destacado">Aún no hay materiales aprobados. ¡Sé el primero!</p>';
            return;
        }

        const agrupados = materiales.reduce((acc, item) => {
            const cat = item.categoria || "Otros insumos educativos";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        for (const categoria in agrupados) {

            const idAncla = "cat-" + categoria.toLowerCase().trim().replace(/\s+/g, '-');

            const divTitulo = document.createElement('div');
            divTitulo.style = "grid-column: 1/-1; margin-top: 40px;";
            divTitulo.innerHTML = `<h2 id="${idAncla}" style="color: maroon; border-bottom: 2px solid #eee; padding-bottom: 10px;">${categoria}</h2>`;
            contenedor.appendChild(divTitulo);

            const subGrid = document.createElement('div');
            subGrid.className = 'grid-materiales';
            subGrid.style = "display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; grid-column:1/-1;";

            agrupados[categoria].forEach(item => {

                const card = document.createElement('div');
                card.className = 'tarjeta-material';

                const imgSource = Array.isArray(item.imagen) ? item.imagen[0] : item.imagen;
                const idImagen = imgSource ? imgSource.match(/[-\w]{25,}/) : null;

                const urlImagenDirecta = idImagen
                    ? `https://lh3.googleusercontent.com/d/${idImagen[0]}`
                    : 'logo-yachay.jpeg';

                const contactoTexto = String(item.contacto || "").trim();
                let linkFinal = "#";
                let target = "_self";

                if (contactoTexto.includes('@')) {
                    linkFinal = `mailto:${contactoTexto}`;
                } else if (contactoTexto.length > 5) {
                    const soloNumeros = contactoTexto.replace(/\D/g, '');
                    linkFinal = `https://wa.me/${soloNumeros}`;
                    target = "_blank";
                }

                card.innerHTML = `
                <div style="width:100%; height:200px; overflow:hidden; border-radius:8px; background:#f0f0f0; border:1px solid #eee;">
                    <img 
                        src="${urlImagenDirecta}" 
                        alt="${item.titulo}" 
                        style="width:100%; height:100%; object-fit:cover; cursor:pointer;"
                        onclick="abrirImagen('${urlImagenDirecta}')"
                        onerror="this.src='logo-yachay.jpeg'">
                </div>

                <div class="info" style="padding:15px 0;">

                    <h3 style="margin:0; font-size:1.2em; color:#333;">
                        ${item.titulo}
                    </h3>

                    <span class="categoria-tag" style="background:#fdeaea; color:maroon; padding:2px 8px; font-size:0.75em; border-radius:15px; font-weight:bold;">
                        ${item.categoria}
                    </span>

                    <p style="margin:10px 0; font-size:0.9em; color:#555; height:40px; overflow:hidden;">
                        ${item.descripcion}
                    </p>

                    <p style="font-weight:bold; color:#b23a48; font-size:1.2em; margin-bottom:15px;">
                        ${item.precio == 0 || item.precio == "0"
                        ? '<span style="color:#28a745;">¡GRATIS!</span>'
                        : '$' + item.precio}
                    </p>

                    <div style="margin-top:10px;">

                        <a href="${linkFinal}" target="${target}"
                        style="display:block; text-align:center; padding:12px; background:#800000; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">
                        Contactar
                        </a>

                        <details style="margin-top:12px; font-size:0.8em; color:#666; text-align:center; cursor:pointer; background:#fdfdfd; padding:8px; border:1px dashed #ccc; border-radius:8px;">

                            <summary style="font-weight:bold; color:#888;">
                            ¿Ya no está disponible?
                            </summary>

                            <p style="margin:8px 0;">
                            ID del producto: <strong>${item.id}</strong>
                            </p>

                            <button
                            onclick="navigator.clipboard.writeText('${item.id}'); alert('ID copiado');"
                            style="background:#eee; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
                            Copiar ID 📋
                            </button>

                            <a href="https://ig.me/m/yachay.li?text=Hola! El producto con ID ${item.id} ya se vendió."
                            target="_blank"
                            style="display:block; color:maroon; text-decoration:none; font-weight:bold;">
                            Informar a Instagram
                            </a>

                        </details>

                    </div>
                </div>
                `;

                subGrid.appendChild(card);
            });

            contenedor.appendChild(subGrid);
        }

    } catch (error) {
        contenedor.innerHTML = '<p class="destacado">⚠️ Error al cargar materiales. Por favor, recargá la página.</p>';
        console.error("Error YACHAY:", error);
    }
}


function abrirImagen(src) {

    const visor = document.createElement("div");

    visor.style = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.9);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;
    cursor:pointer;
    `;

    visor.innerHTML = `
        <img src="${src}" style="max-width:90%; max-height:90%; border-radius:8px;">
    `;

    visor.onclick = function () {
        document.body.removeChild(visor);
    };

    document.body.appendChild(visor);
}


function filtrarMateriales() {
    const texto = document.getElementById('inputBusqueda').value.toLowerCase();

    document.querySelectorAll('.tarjeta-material').forEach(t => {
        t.style.display = t.innerText.toLowerCase().includes(texto) ? "block" : "none";
    });
}


window.onscroll = function() {
    let btn = document.getElementById("btn-volver");
    if (!btn) return;

    if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
};

function irArriba() {
    window.scrollTo({top:0, behavior:'smooth'});
    window.history.replaceState(null, null, window.location.pathname);
}

document.addEventListener('DOMContentLoaded', cargarMateriales);



