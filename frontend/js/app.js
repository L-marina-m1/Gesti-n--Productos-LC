
// ======================================
// ATENCIONTOTAL - CONEXION CON API REST
// ======================================

// CAMBIA ESTA RUTA SI TU API UTILIZA OTRA
const API_URL = "http://localhost:3000/api/clientes";

let clientes = [];

const tabla = document.getElementById("tablaClientes");
const modal = document.getElementById("modalCliente");
const formulario = document.getElementById("formCliente");
const mensaje = document.getElementById("mensaje");

// ======================================
// MENSAJES
// ======================================

function mostrarMensaje(texto, error = false) {
    mensaje.textContent = texto;
    mensaje.style.color = error ? "#dc2626" : "#16a34a";
}

// ======================================
// ESCAPAR TEXTO PARA HTML
// ======================================

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, letra => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[letra]);
}

// ======================================
// OBTENER CLIENTES DESDE LA API
// ======================================

async function obtenerClientes() {
    tabla.innerHTML = `
        <tr><td colspan="6">Cargando información...</td></tr>
    `;

    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los clientes.");
        }

        const datos = await respuesta.json();

        // Admite respuestas como array o { clientes: [...] }
        clientes = Array.isArray(datos)
            ? datos
            : (datos.clientes || datos.data || []);

        mostrarClientes(clientes);
        actualizarEstadisticas();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6">
                    No se pudo conectar con la API.
                    Revisa que tu backend esté funcionando.
                </td>
            </tr>
        `;

        mostrarMensaje(error.message, true);
    }
}

// ======================================
// MOSTRAR CLIENTES EN LA TABLA
// ======================================

function mostrarClientes(lista) {
    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6">No hay clientes registrados.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = lista.map(cliente => {
        const id = cliente.id ?? cliente.id_cliente ?? cliente.cliente_id;

        return `
            <tr>
                <td>${escapar(id)}</td>
                <td>${escapar(cliente.nombre ?? cliente.nombre_completo)}</td>
                <td>${escapar(cliente.correo ?? cliente.email)}</td>
                <td>${escapar(cliente.telefono ?? cliente.celular)}</td>
                <td>${escapar(cliente.plataforma ?? "No especificada")}</td>
                <td>
                    <div class="acciones">
                        <button class="btn-editar"
                            data-editar="${escapar(id)}">
                            Editar
                        </button>

                        <button class="btn-eliminar"
                            data-eliminar="${escapar(id)}">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ======================================
// ACTUALIZAR ESTADISTICAS
// ======================================

function actualizarEstadisticas() {
    document.getElementById("totalClientes").textContent =
        clientes.length;

    document.getElementById("totalContactos").textContent =
        clientes.filter(c => c.telefono || c.celular || c.correo || c.email).length;

    const plataformas = new Set(
        clientes.map(c => c.plataforma).filter(Boolean)
    );

    document.getElementById("totalPlataformas").textContent =
        plataformas.size;
}

// ======================================
// ABRIR FORMULARIO
// ======================================

function abrirModal(cliente = null) {
    formulario.reset();

    document.getElementById("clienteId").value = "";

    if (cliente) {
        document.getElementById("tituloFormulario").textContent =
            "Editar cliente";

        document.getElementById("clienteId").value =
            cliente.id ?? cliente.id_cliente ?? cliente.cliente_id;

        document.getElementById("nombre").value =
            cliente.nombre ?? cliente.nombre_completo ?? "";

        document.getElementById("correo").value =
            cliente.correo ?? cliente.email ?? "";

        document.getElementById("telefono").value =
            cliente.telefono ?? cliente.celular ?? "";

        document.getElementById("plataforma").value =
            cliente.plataforma ?? "";
    } else {
        document.getElementById("tituloFormulario").textContent =
            "Registrar cliente";
    }

    modal.classList.add("mostrar");
}

function cerrarModal() {
    modal.classList.remove("mostrar");
}

// ======================================
// REGISTRAR O EDITAR CLIENTE
// ======================================

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const id = document.getElementById("clienteId").value;

    const cliente = {
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        plataforma: document.getElementById("plataforma").value
    };

    try {
        const respuesta = await fetch(
            id ? `${API_URL}/${encodeURIComponent(id)}` : API_URL,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cliente)
            }
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo guardar el cliente.");
        }

        cerrarModal();
        await obtenerClientes();

        mostrarMensaje(
            id ? "Cliente actualizado correctamente." :
                 "Cliente registrado correctamente."
        );

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

// ======================================
// EDITAR CLIENTE
// ======================================

tabla.addEventListener("click", function(evento) {
    const boton = evento.target.closest("[data-editar]");

    if (!boton) return;

    const id = boton.dataset.editar;

    const cliente = clientes.find(c =>
        String(c.id ?? c.id_cliente ?? c.cliente_id) === id
    );

    if (cliente) {
        abrirModal(cliente);
    }
});

// ======================================
// ELIMINAR CLIENTE
// ======================================

tabla.addEventListener("click", async function(evento) {
    const boton = evento.target.closest("[data-eliminar]");

    if (!boton) return;

    const id = boton.dataset.eliminar;

    if (!confirm("¿Estás seguro de eliminar este cliente?")) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el cliente.");
        }

        await obtenerClientes();
        mostrarMensaje("Cliente eliminado correctamente.");

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

// ======================================
// BUSCAR CLIENTES
// ======================================

function buscarClientes() {
    const texto = document.getElementById("buscar")
        .value.toLowerCase().trim();

    const resultado = clientes.filter(cliente => {
        const informacion = [
            cliente.nombre,
            cliente.nombre_completo,
            cliente.correo,
            cliente.email,
            cliente.telefono,
            cliente.celular,
            cliente.plataforma
        ].join(" ").toLowerCase();

        return informacion.includes(texto);
    });

    mostrarClientes(resultado);
}

document.getElementById("btnBuscar")
    .addEventListener("click", buscarClientes);

document.getElementById("buscar")
    .addEventListener("input", buscarClientes);

// ======================================
// BOTONES DEL FORMULARIO
// ======================================

document.getElementById("btnNuevo")
    .addEventListener("click", () => abrirModal());

document.getElementById("btnCerrar")
    .addEventListener("click", cerrarModal);

document.getElementById("btnCancelar")
    .addEventListener("click", cerrarModal);

// ======================================
// MENÚ DE NAVEGACIÓN
// ======================================

document.getElementById("menuInicio")
    .addEventListener("click", e => {
        e.preventDefault();
        document.getElementById("tituloSeccion").textContent =
            "Lista de clientes";
        obtenerClientes();
    });

document.getElementById("menuClientes")
    .addEventListener("click", e => {
        e.preventDefault();
        document.getElementById("tituloSeccion").textContent =
            "Lista de clientes";
        obtenerClientes();
    });

document.getElementById("menuContactos")
    .addEventListener("click", e => {
        e.preventDefault();
        document.getElementById("tituloSeccion").textContent =
            "Contactos de clientes";
        document.getElementById("buscar").focus();
    });

// ======================================
// INICIAR SISTEMA
// ======================================

obtenerClientes();
