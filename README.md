## Camera Finger Detector

Uma biblioteca JavaScript para detectar quando um dedo está próximo ou encostado na lente da câmera.

### Recursos

* Identifica três estados:
    * **Câmera limpa** (sem dedo detectado).
    * **Dedo detectado, mas afastado** (dedo a poucos centímetros).
    * **Dedo encostado na lente** (dedo cobrindo a câmera).
* Configurável com limiares personalizáveis para diferentes condições de iluminação.

---

### Instalação

Para instalar a biblioteca, execute o seguinte comando no terminal:

```bash
npm install @luann8/camera-finger-detector
```

---

### Uso

Siga os passos abaixo para usar a biblioteca:

1.  Inclua a biblioteca no seu projeto:

    ```javascript
    import CameraFingerDetector from '@luann8/camera-finger-detector';
    ```

2.  Crie uma instância do detector:

    ```javascript
    const detector = new CameraFingerDetector({
        videoElementId: 'player',
        canvasElementId: 'canvas',
        statusElementId: 'status',
        analysisAreaElementId: 'analysisArea',
        frameIntervalMs: 500
    });
    ```

---

### Exemplo

Veja o exemplo em `test/index.html` e `test/test.js` para uma demonstração com botões de controle.

---

### Licença

MIT


