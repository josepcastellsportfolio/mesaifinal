# MesaIFinal Frontend Helm Chart

Este chart de Helm despliega la aplicación frontend de MesaIFinal en Kubernetes.

## Prerrequisitos

- Kubernetes 1.19+
- Helm 3.0+
- Nginx Ingress Controller
- Cert-Manager (para TLS)

## Instalación

### Instalación básica

```bash
# Agregar el repositorio (si existe)
helm repo add mesaifinal https://charts.mesaifinal.com

# Instalar el chart
helm install mesaifinal-frontend ./helm/mesaifinal-frontend
```

### Instalación con valores personalizados

```bash
# Crear un archivo de valores personalizados
cat > custom-values.yaml << EOF
replicaCount: 5
image:
  tag: "v1.2.0"
ingress:
  hosts:
    - host: app.miempresa.com
      paths:
        - path: /
          pathType: Prefix
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
EOF

# Instalar con valores personalizados
helm install mesaifinal-frontend ./helm/mesaifinal-frontend -f custom-values.yaml
```

## Configuración

### Parámetros principales

| Parámetro | Descripción | Valor por defecto |
|-----------|-------------|-------------------|
| `replicaCount` | Número de réplicas | `3` |
| `image.repository` | Repositorio de la imagen | `mesaifinal/frontend` |
| `image.tag` | Tag de la imagen | `latest` |
| `image.pullPolicy` | Política de pull de imagen | `IfNotPresent` |
| `service.type` | Tipo de servicio | `ClusterIP` |
| `service.port` | Puerto del servicio | `80` |
| `ingress.enabled` | Habilitar Ingress | `true` |
| `ingress.className` | Clase del Ingress | `nginx` |
| `resources.limits.cpu` | Límite de CPU | `200m` |
| `resources.limits.memory` | Límite de memoria | `256Mi` |
| `autoscaling.enabled` | Habilitar autoscaling | `true` |
| `autoscaling.minReplicas` | Mínimo de réplicas | `2` |
| `autoscaling.maxReplicas` | Máximo de réplicas | `10` |

### Configuración de recursos

```yaml
resources:
  limits:
    cpu: 500m
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 512Mi
```

### Configuración de autoscaling

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
```

### Configuración de Ingress

```yaml
ingress:
  enabled: true
  className: "nginx"
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
  hosts:
    - host: app.mesaifinal.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: mesaifinal-frontend-tls
      hosts:
        - app.mesaifinal.com
```

## Variables de entorno

### Configuración básica

```yaml
env:
  NODE_ENV: "production"
  VITE_API_URL: "https://api.mesaifinal.com"
```

### ConfigMap

```yaml
configMap:
  enabled: true
  data:
    api_url: "https://api.mesaifinal.com"
    environment: "production"
```

### Secrets

```yaml
secrets:
  enabled: true
  data:
    kendo_license_key: "your-license-key-here"
```

## Health Checks

### Liveness Probe

```yaml
livenessProbe:
  enabled: true
  path: /health
  port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe

```yaml
readinessProbe:
  enabled: true
  path: /health
  port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

## Seguridad

### Security Context

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

### Pod Security Context

```yaml
podSecurityContext:
  fsGroup: 1001
```

## Actualización

```bash
# Actualizar con nuevos valores
helm upgrade mesaifinal-frontend ./helm/mesaifinal-frontend -f custom-values.yaml

# Actualizar solo la imagen
helm upgrade mesaifinal-frontend ./helm/mesaifinal-frontend --set image.tag=v1.2.1
```

## Desinstalación

```bash
# Desinstalar el release
helm uninstall mesaifinal-frontend

# Verificar que se eliminó
kubectl get all -l app.kubernetes.io/instance=mesaifinal-frontend
```

## Troubleshooting

### Verificar el estado de los pods

```bash
kubectl get pods -l app.kubernetes.io/name=mesaifinal-frontend
kubectl describe pod <pod-name>
```

### Ver logs

```bash
kubectl logs -l app.kubernetes.io/name=mesaifinal-frontend
kubectl logs -f <pod-name>
```

### Verificar servicios

```bash
kubectl get svc -l app.kubernetes.io/name=mesaifinal-frontend
kubectl describe svc <service-name>
```

### Verificar Ingress

```bash
kubectl get ingress -l app.kubernetes.io/name=mesaifinal-frontend
kubectl describe ingress <ingress-name>
```

### Verificar HPA

```bash
kubectl get hpa -l app.kubernetes.io/name=mesaifinal-frontend
kubectl describe hpa <hpa-name>
```

## Desarrollo

### Renderizar templates localmente

```bash
# Renderizar todos los templates
helm template mesaifinal-frontend ./helm/mesaifinal-frontend

# Renderizar con valores personalizados
helm template mesaifinal-frontend ./helm/mesaifinal-frontend -f custom-values.yaml

# Renderizar solo un template específico
helm template mesaifinal-frontend ./helm/mesaifinal-frontend --show-only templates/deployment.yaml
```

### Validar el chart

```bash
# Validar sintaxis
helm lint ./helm/mesaifinal-frontend

# Validar con valores
helm lint ./helm/mesaifinal-frontend -f custom-values.yaml
```

### Dry run

```bash
# Simular instalación
helm install mesaifinal-frontend ./helm/mesaifinal-frontend --dry-run

# Simular actualización
helm upgrade mesaifinal-frontend ./helm/mesaifinal-frontend --dry-run
```

## Contribución

Para contribuir al chart:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz los cambios necesarios
4. Actualiza la documentación
5. Ejecuta las validaciones
6. Crea un Pull Request

## Licencia

Este chart está bajo la misma licencia que el proyecto principal.
