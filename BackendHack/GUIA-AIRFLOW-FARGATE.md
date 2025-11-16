# 🚀 Guía de Despliegue: Apache Airflow en ECS Fargate (AWS Academy)

## 📋 Requisito del Proyecto
Desplegar Apache Airflow en un **contenedor ECS con Fargate** para cumplir con las especificaciones del hackathon.

---

## ✅ PASO 1: Crear Base de Datos RDS (PostgreSQL)

### Via Consola AWS:

1. Ve a **AWS Console** → **RDS**
2. Click en **"Create database"**
3. Configuración:
   - **Engine**: PostgreSQL
   - **Version**: PostgreSQL 14.x
   - **Templates**: Free tier (si está disponible) o Dev/Test
   - **DB instance identifier**: `alerta-utec-airflow-db`
   - **Master username**: `airflow`
   - **Master password**: `AirflowUTEC2025!`
   - **DB instance class**: db.t3.micro
   - **Storage**: 20 GB
   - **Public access**: Yes (para desarrollo)
   - **VPC security group**: Create new → Nombre: `airflow-db-sg`
   - **Database name**: `airflow`

4. Click **"Create database"**
5. **Espera 5-10 minutos** mientras se crea
6. **Anota el Endpoint** (algo como: `alerta-utec-airflow-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`)

### Configurar Security Group:

1. Ve a **EC2** → **Security Groups**
2. Busca el security group de la base de datos
3. Click en **"Edit inbound rules"**
4. **Add rule**:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Anywhere (0.0.0.0/0) - Solo para desarrollo

---

## ✅ PASO 2: Crear Repositorio ECR

1. Ve a **AWS Console** → **ECR** (Elastic Container Registry)
2. Click en **"Create repository"**
3. Configuración:
   - **Visibility**: Private
   - **Repository name**: `alerta-utec-airflow`
   - **Tag immutability**: Disabled
   - **Scan on push**: Enabled

4. Click **"Create repository"**
5. **Anota el URI del repositorio** (ejemplo: `429096294781.dkr.ecr.us-east-1.amazonaws.com/alerta-utec-airflow`)

---

## ✅ PASO 3: Build y Push de la Imagen Docker

### Opción A: Si tienes Docker Desktop instalado y corriendo

```powershell
# Navegar a la carpeta del proyecto
cd C:\Users\karol\BackendHack

# Login a ECR (reemplaza ACCOUNT_ID con tu número de cuenta AWS)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 429096294781.dkr.ecr.us-east-1.amazonaws.com

# Build de la imagen
docker build -f airflow/Dockerfile -t alerta-utec-airflow .

# Tag de la imagen
docker tag alerta-utec-airflow:latest 429096294781.dkr.ecr.us-east-1.amazonaws.com/alerta-utec-airflow:latest

# Push a ECR
docker push 429096294781.dkr.ecr.us-east-1.amazonaws.com/alerta-utec-airflow:latest
```

### Opción B: Usar imagen pre-construida de Apache Airflow

Si no puedes hacer build local, usa la imagen oficial:
- Imagen: `apache/airflow:2.10.3-python3.11`
- **Nota**: Necesitarás subir los DAGs después via S3 o EFS

---

## ✅ PASO 4: Crear CloudWatch Log Group

1. Ve a **CloudWatch** → **Logs** → **Log groups**
2. Click **"Create log group"**
3. **Log group name**: `/ecs/alerta-utec-airflow`
4. Click **"Create"**

---

## ✅ PASO 5: Crear Cluster ECS

1. Ve a **ECS** → **Clusters**
2. Click **"Create cluster"**
3. **Cluster name**: `alerta-utec-airflow-cluster`
4. **Infrastructure**: AWS Fargate (serverless)
5. Click **"Create"**

---

## ✅ PASO 6: Crear Task Definition

1. Ve a **ECS** → **Task Definitions**
2. Click **"Create new task definition"**
3. Click **"Create new task definition with JSON"**
4. Pega el siguiente JSON (reemplaza los valores):

```json
{
  "family": "alerta-utec-airflow",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::429096294781:role/LabRole",
  "taskRoleArn": "arn:aws:iam::429096294781:role/LabRole",
  "containerDefinitions": [
    {
      "name": "airflow-webserver",
      "image": "429096294781.dkr.ecr.us-east-1.amazonaws.com/alerta-utec-airflow:latest",
      "essential": true,
      "command": ["webserver"],
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "AIRFLOW__DATABASE__SQL_ALCHEMY_CONN",
          "value": "postgresql+psycopg2://airflow:AirflowUTEC2025!@TU_RDS_ENDPOINT:5432/airflow"
        },
        {
          "name": "AIRFLOW__CORE__EXECUTOR",
          "value": "LocalExecutor"
        },
        {
          "name": "AIRFLOW__CORE__LOAD_EXAMPLES",
          "value": "false"
        },
        {
          "name": "AIRFLOW__CORE__DAGS_FOLDER",
          "value": "/opt/airflow/dags"
        },
        {
          "name": "AWS_DEFAULT_REGION",
          "value": "us-east-1"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/alerta-utec-airflow",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "webserver"
        }
      }
    },
    {
      "name": "airflow-scheduler",
      "image": "429096294781.dkr.ecr.us-east-1.amazonaws.com/alerta-utec-airflow:latest",
      "essential": true,
      "command": ["scheduler"],
      "environment": [
        {
          "name": "AIRFLOW__DATABASE__SQL_ALCHEMY_CONN",
          "value": "postgresql+psycopg2://airflow:AirflowUTEC2025!@TU_RDS_ENDPOINT:5432/airflow"
        },
        {
          "name": "AIRFLOW__CORE__EXECUTOR",
          "value": "LocalExecutor"
        },
        {
          "name": "AIRFLOW__CORE__LOAD_EXAMPLES",
          "value": "false"
        },
        {
          "name": "AIRFLOW__CORE__DAGS_FOLDER",
          "value": "/opt/airflow/dags"
        },
        {
          "name": "AWS_DEFAULT_REGION",
          "value": "us-east-1"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/alerta-utec-airflow",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "scheduler"
        }
      }
    }
  ]
}
```

**IMPORTANTE**: Reemplaza `TU_RDS_ENDPOINT` con el endpoint real de tu RDS PostgreSQL.

5. Click **"Create"**

---

## ✅ PASO 7: Inicializar Base de Datos de Airflow

Antes de crear el servicio, necesitas inicializar la base de datos:

1. Ve a **ECS** → **Clusters** → Tu cluster
2. Click **"Run new task"**
3. Configuración:
   - **Launch type**: Fargate
   - **Task Definition**: alerta-utec-airflow (latest)
   - **Cluster**: alerta-utec-airflow-cluster
   - **Platform version**: LATEST
   - **Subnets**: Selecciona al menos una subnet pública
   - **Security group**: Crea uno nuevo o usa el default
     - **Inbound**: Permite 8080 desde 0.0.0.0/0
   - **Auto-assign public IP**: ENABLED

4. Expand **"Container Overrides"** → Click en **airflow-webserver**
5. En **"Command override"**, cambia a:
   ```
   bash,-c,airflow db migrate && airflow users create --username admin --firstname Admin --lastname UTEC --role Admin --email admin@utec.edu.pe --password admin
   ```

6. Click **"Run task"**
7. **Espera** a que la tarea complete (status: STOPPED)
8. Verifica en CloudWatch Logs que se creó el usuario admin

---

## ✅ PASO 8: Crear Servicio ECS

1. Ve a **ECS** → **Clusters** → Tu cluster
2. Click **"Create service"**
3. Configuración:
   - **Launch type**: Fargate
   - **Task Definition**: alerta-utec-airflow (latest)
   - **Service name**: `airflow-service`
   - **Number of tasks**: 1
   - **Deployment type**: Rolling update

4. **Networking**:
   - **VPC**: Default VPC
   - **Subnets**: Selecciona subnets públicas
   - **Security group**: Crea nuevo
     - Nombre: `airflow-ecs-sg`
     - **Inbound rule**: 
       - Type: Custom TCP
       - Port: 8080
       - Source: 0.0.0.0/0 (Anywhere)
   - **Public IP**: ENABLED

5. **Load balancing**: None (para desarrollo)

6. Click **"Create"**

---

## ✅ PASO 9: Obtener URL Pública

1. Ve a **ECS** → **Clusters** → Tu cluster → **Tasks**
2. Click en la tarea que está **RUNNING**
3. En la sección **"Network"**, copia la **Public IP**
4. Accede a Airflow:
   ```
   http://TU_IP_PUBLICA:8080
   ```
5. Login:
   - **Username**: admin
   - **Password**: admin

---

## 🎯 PASO 10: Verificar DAGs

Una vez dentro de Airflow UI:

1. Ve a la pestaña **"DAGs"**
2. Deberías ver tus 3 DAGs:
   - `clasificar_incidentes`
   - `enviar_notificaciones`
   - `generar_reportes`

3. **Activa cada DAG** con el toggle switch
4. Click en un DAG → **"Graph"** para ver el flujo
5. Click en **"Trigger DAG"** para ejecutar manualmente

---

## 🔧 Troubleshooting

### Si los DAGs no aparecen:

**Problema**: La imagen Docker no tiene los DAGs incluidos.

**Solución rápida**: Usa S3 para almacenar los DAGs

1. Crea un bucket S3: `alerta-utec-airflow-dags`
2. Sube los archivos de `airflow/dags/` al bucket
3. Modifica la Task Definition para montar el bucket S3

### Si no puedes acceder por IP:

1. Verifica que el Security Group permite puerto 8080
2. Verifica que la tarea tiene Public IP asignada
3. Verifica que está en una subnet pública

### Si la base de datos no conecta:

1. Verifica que el Security Group de RDS permite 5432
2. Verifica el endpoint de RDS en la Task Definition
3. Revisa CloudWatch Logs para errores de conexión

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                     Internet                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   ECS Fargate        │
              │  ┌────────────────┐  │
              │  │ Airflow        │  │
              │  │ Webserver      │  │ :8080
              │  └────────────────┘  │
              │  ┌────────────────┐  │
              │  │ Airflow        │  │
              │  │ Scheduler      │  │
              │  └────────────────┘  │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   RDS PostgreSQL     │
              │   (Metadata DB)      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Lambda Functions   │
              │   + DynamoDB         │
              └──────────────────────┘
```

---

## ✅ Checklist de Completado

- [ ] RDS PostgreSQL creado y accesible
- [ ] ECR Repository creado
- [ ] Imagen Docker subida a ECR (o usando imagen oficial)
- [ ] CloudWatch Log Group creado
- [ ] ECS Cluster creado
- [ ] Task Definition configurada
- [ ] Base de datos inicializada (airflow db migrate)
- [ ] Usuario admin creado
- [ ] Servicio ECS corriendo
- [ ] Airflow UI accesible vía IP pública
- [ ] 3 DAGs visibles y activados
- [ ] DAGs ejecutándose correctamente

---

## 💰 Costos Estimados (AWS Academy)

Todo debería estar cubierto por AWS Academy:
- ✅ ECS Fargate: Incluido
- ✅ RDS db.t3.micro: Incluido
- ✅ ECR: 500 MB gratis
- ✅ CloudWatch Logs: 5 GB gratis

---

## 🎓 Para la Presentación

**Puntos clave sobre Airflow en Fargate:**

1. ✅ **Contenedor en ECS** - Cumple requisito del proyecto
2. ✅ **Fargate serverless** - Sin gestión de servidores
3. ✅ **Escalable** - Se puede aumentar el número de tasks
4. ✅ **Alta disponibilidad** - AWS maneja la infraestructura
5. ✅ **3 DAGs operativos** - Clasificación, notificaciones, reportes

**Diagrama de arquitectura completa:**
- Frontend → API Gateway → Lambda (9 microservicios)
- Airflow en Fargate → Ejecuta DAGs cada X minutos
- DAGs consultan DynamoDB y actualizan estados
- Notificaciones vía WebSocket en tiempo real

---

¿Necesitas ayuda con algún paso específico?
