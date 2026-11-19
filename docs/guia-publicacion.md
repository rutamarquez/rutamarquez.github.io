# Guía de publicación: GitHub Pages y códigos QR

Se hace una sola vez. Al final, la app queda en un enlace fijo y se actualiza sola.

## 1. Crear la organización en GitHub

1. Entre a GitHub con el correo institucional y vaya a
   [github.com/organizations/plan](https://github.com/organizations/plan) → plan **Free**.
2. Nombre sugerido: `rutamarquez` (si está ocupado, otro corto y sin el nombre de una persona).
   **Ese nombre queda en el enlace del QR.**
3. Invite al menos a **otro integrante como Owner** (People > Invite member > Role: Owner).
   Los correos institucionales se desactivan al graduarse: con un solo dueño se puede perder el acceso.

## 2. Crear el repositorio y subir el código

1. En la organización: New repository → nombre **`rutamarquez.github.io`** (el mismo nombre de la
   organización seguido de `.github.io`), público.
   Con ese nombre el enlace queda corto: `https://rutamarquez.github.io`.
2. En VS Code, abra la carpeta del proyecto y en la terminal:

```bash
git init
git add .
git commit -m "Primera versión de Ruta Márquez"
git branch -M main
git remote add origin https://github.com/rutamarquez/rutamarquez.github.io.git
git push -u origin main
```

Antes del `git add`, revise que `datos/privado/` **no** aparezca en `git status`.

## 3. Configurar la publicación automática

En el repositorio de GitHub:

1. **Settings > Pages > Build and deployment > Source:** `GitHub Actions`.
2. **Settings > Secrets and variables > Actions > Secrets > New repository secret:**
   - Nombre: `CODIGOS_SELLOS`
   - Valor: pegue el contenido completo de `datos/privado/codigos_sellos.csv`.
3. (Para las reseñas) misma pantalla, pestaña **Variables**, cree las cuatro variables
   `VITE_FIREBASE_…` con los valores de Firebase (ver `guia-firebase.md`).
4. Pestaña **Actions** > "Publicar Ruta Márquez" > **Run workflow**.

En uno o dos minutos la app queda en `https://rutamarquez.github.io`. Desde ahí, cada
`git push` la vuelve a publicar.

## 4. Generar los QR

Cuando el enlace funcione:

```bash
python scripts/generar_qr.py https://rutamarquez.github.io
```

Se crea `qr-municipios.pdf` con un QR por municipio y uno general. Cada QR de municipio abre la
app mostrando "Estás en …" con los emprendimientos de ese lugar.

**Pruebe cada QR con dos o tres celulares distintos antes de mandar a imprimir.**

## 5. Entregar a la alcaldía

1. La alcaldía crea su cuenta de GitHub (ideal con un correo institucional de la alcaldía).
2. En la organización: People > Invite member > esa cuenta como **Owner**.
3. Lo mismo en Firebase: Configuración del proyecto > Usuarios y permisos > Agregar miembro > Propietario.
4. Entregue en persona (no por WhatsApp) el archivo `codigos_sellos.csv` y el Excel del Forms.
5. Cuando la alcaldía confirme que tiene acceso, los estudiantes se retiran de la organización.

El enlace y los QR no cambian.

### Si la alcaldía quiere un dominio propio
Por ejemplo `turismo.ramiriqui-boyaca.gov.co`: Settings > Pages > Custom domain. **Ojo:** los
QR ya impresos apuntan al enlace de GitHub. GitHub redirige al dominio nuevo, así que siguen
funcionando mientras la organización exista.
