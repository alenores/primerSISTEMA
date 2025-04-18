// Verificar autenticación
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// Configurar headers para las peticiones
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// Manejar cierre de sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});

// Manejar pestañas
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remover clase active de todos los botones y contenidos
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Agregar clase active al botón y contenido seleccionado
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Cargar datos iniciales
async function cargarDatos() {
    try {
        const [alumnosResponse, asistenciasResponse] = await Promise.all([
            fetch('/api/alumnos', { headers }),
            fetch('/api/asistencias', { headers })
        ]);

        if (alumnosResponse.ok && asistenciasResponse.ok) {
            const alumnos = await alumnosResponse.json();
            const asistencias = await asistenciasResponse.json();
            
            mostrarAlumnos(alumnos);
            mostrarAsistencias(asistencias);
        } else {
            throw new Error('Error al cargar los datos');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos');
    }
}

// Mostrar lista de alumnos
function mostrarAlumnos(alumnos) {
    const container = document.getElementById('alumnosList');
    container.innerHTML = alumnos.map(alumno => `
        <div class="alumno-card">
            <h3>${alumno.nombre} ${alumno.apellido}</h3>
            <p>Color de pelo: ${alumno.color_pelo}</p>
            <button onclick="editarAlumno(${alumno.id})">Editar</button>
            <button onclick="eliminarAlumno(${alumno.id})">Eliminar</button>
        </div>
    `).join('');
}

// Mostrar lista de asistencias
function mostrarAsistencias(asistencias) {
    const container = document.getElementById('asistenciasList');
    container.innerHTML = asistencias.map(asistencia => `
        <div class="asistencia-card">
            <h3>${asistencia.alumno_nombre}</h3>
            <p>Fecha: ${asistencia.fecha}</p>
            <p>Materia: ${asistencia.materia}</p>
            <button onclick="editarAsistencia(${asistencia.id})">Editar</button>
            <button onclick="eliminarAsistencia(${asistencia.id})">Eliminar</button>
        </div>
    `).join('');
}

// Cargar datos al iniciar
cargarDatos(); 