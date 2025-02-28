const contextMenu = document.getElementById("context-menu");

document.addEventListener("contextmenu", (event) => {
    event.preventDefault(); // Impede o menu padrão do navegador

    
    // Coordenadas do mouse
    const { clientX: mouseX, clientY: mouseY } = event;
    
    // Dimensões da janela e do menu
    contextMenu.style.display = "block";
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const { offsetWidth: menuWidth, offsetHeight: menuHeight } = contextMenu;

    // Coordenadas ajustadas para evitar ultrapassar os limites da janela
    let adjustedX = mouseX;
    let adjustedY = mouseY;

    // Verifica se o menu ultrapassa a borda direita
    if (mouseX + menuWidth > windowWidth) {
        adjustedX = windowWidth - menuWidth;
    }

    // Verifica se o menu ultrapassa a borda inferior
    if (mouseY + menuHeight > windowHeight) {
        adjustedY = windowHeight - menuHeight;
    }

    // Aplica as coordenadas ajustadas ao menu
    contextMenu.style.top = `${adjustedY}px`;
    contextMenu.style.left = `${adjustedX}px`;
    
    console.log(`Mouse: X=${mouseX}, Y=${mouseY}`);
    console.log(`Menu: W=${menuWidth}, H=${menuHeight}`);
    console.log(`Adjusted: X=${adjustedX}, Y=${adjustedY}`);
});

document.addEventListener("click", () => {
    contextMenu.style.display = "none"; // Fecha o menu ao clicar em qualquer lugar
});
