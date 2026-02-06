 // Esta función detecta cuando las tarjetas entran en la pantalla
        const observerOptions = {
            threshold: 0.2 // Se activa cuando el 20% del elemento es visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Añadimos un pequeño retraso (delay) basado en el índice para efecto cascada
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, index * 100); // 100ms de diferencia entre cada tarjeta
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Seleccionamos todas las tarjetas y las observamos
        document.querySelectorAll('.product-card').forEach(card => {
            observer.observe(card);
        });