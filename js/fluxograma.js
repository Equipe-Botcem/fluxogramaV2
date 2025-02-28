let fluxogramaCarregado = false;
const decoder = new TextDecoder('utf-8');
materiasFeitas = []

function stateButton(button){
    state = ""
    if (button.style.borderColor == "rgb(255, 124, 0)") state+="Sem_pre" //borda laranja - sem prerequisito
    
    if(button.style.backgroundColor == "rgb(52, 152, 219)") state+="Dispo" //botao azul - disponivel
    else if(button.style.backgroundColor == "rgb(46, 204, 113)") state+="Ativo" //botao verde - ativo
    else state += "Indis" //botao normal - indisponivel
    return state
}

function ativaButton(button){
    button.style.backgroundColor = "rgb(46, 204, 113)"
    materiasFeitas.push(button.getAttribute("cod"))
    
}
function desativaButton(button){
    button.style.backgroundColor = "#D3D6D9"
    materiasFeitas = materiasFeitas.filter(materia => materia !== button.getAttribute("cod"));
}
function disponibilizaButton(button){
    button.style.backgroundColor = "rgb(52, 152, 219)"
    materiasFeitas = materiasFeitas.filter(materia => materia !== button.getAttribute("cod"));
}

function updateButtons(){
    if(fluxogramaCarregado == false) return;
    const buttons = document.getElementsByClassName("btnMateria")
    for (let i = 0; i < buttons.length; i++) {
        button = buttons[i]
        prereqs = button.getAttribute("prereq").slice(1, -1).split(",")
        cod = button.getAttribute("cod")
        stateMateria = stateButton(button)
        
        todosPrereqAtivo = true
        prereqs.forEach((prereq) => {
            if (prereq == "") return
            prereq = prereq.trim()
            btnPrereq = document.getElementById("btn" + prereq)
            statePrereq = stateButton(btnPrereq)
            if (!statePrereq.includes("Ativo")) {
                todosPrereqAtivo = false;
            }
        })
        if(todosPrereqAtivo && !stateMateria.includes("Ativo")  && !stateMateria.includes("Sem_pre")){
            disponibilizaButton(button)
        }
        else if(todosPrereqAtivo == false){
            desativaButton(button)
        }
    }

}

let cancelaMouseLeave = false
function tiraDestaqueBotoes(){
    const buttons = document.getElementsByClassName("btnMateria")
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("btnDestacado")
        buttons[i].classList.remove("btnPrereqIme")
        var mouseFora = !buttons[i].matches(':hover');
        if(mouseFora == false){
            destacarPrerequisito(buttons[i],0)
        }
    }
}
function destacarPrerequisito(button, profundidade){
    button.classList.add("btnDestacado")
    if(profundidade == 1) button.classList.add("btnPrereqIme")
    prereqs = button.getAttribute("prereq").slice(1, -1).split(",")
    prereqs.forEach((codigoPrereq) => {
        if(codigoPrereq=="")return
        codigoPrereq = codigoPrereq.trim()
        btnPrereq = document.getElementById("btn"+codigoPrereq)
        destacarPrerequisito(btnPrereq, profundidade+1)
    })
}
function mouseSobreBotaoDestacado(){
    let todosSemMouse = true
    const buttons = document.getElementsByClassName("btnDestacado")
    for (let i = 0; i < buttons.length; i++) {
        var mouseFora = !buttons[i].matches(':hover');
        if(mouseFora == false){
            todosSemMouse = false
            break
        }
    }
    return !todosSemMouse
}

function todasMateriasDestacadasAtivas(){
    const buttons = document.getElementsByClassName("btnDestacado")
    for (let i = 0; i < buttons.length; i++) {
        state = stateButton(buttons[i])
        if(!state.includes("Ativo")) return false
    }
    return true
}

//context menu
const contextMenu = document.getElementById("context-menu");

function contextMenuM(event, cod, materia) {
    event.preventDefault();

    // Coordenadas do mouse, levando em conta o scroll
    const { pageX: mouseX, pageY: mouseY } = event;

    // Dimensões da janela e do menu
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const { offsetWidth: menuWidth, offsetHeight: menuHeight } = contextMenu;

    // Offset para evitar sobreposição direta com o mouse
    const offset = 5;

    // Coordenadas ajustadas para evitar ultrapassar os limites da janela
    let adjustedX = mouseX + offset;
    let adjustedY = mouseY + offset;

    if (mouseX + menuWidth > windowWidth + window.scrollX) {
        adjustedX = windowWidth + window.scrollX - menuWidth;
    }

    if (mouseY + menuHeight > windowHeight + window.scrollY) {
        adjustedY = windowHeight + window.scrollY - menuHeight;
    }

    // Aplica as coordenadas ajustadas ao menu
    contextMenu.style.top = `${adjustedY}px`;
    contextMenu.style.left = `${adjustedX}px`;
    contextMenu.style.display = "block";
    contextMenu.getElementsByTagName("li")[0].onclick = () => {
        navigator.clipboard.writeText(cod)
    }
    contextMenu.getElementsByTagName("li")[1].onclick = () => {
        navigator.clipboard.writeText(materia)
    }
}

document.addEventListener("click", () => {
    contextMenu.style.display = "none"; // Fecha o menu ao clicar em qualquer lugar
});


function addMateria(codigo, materia, prereq, fase){
    const novoBotao = document.createElement('button');

    // Definir o texto do botão
    novoBotao.textContent = codigo + " - " + materia;
    novoBotao.className = "btnMateria"
    novoBotao.id = "btn" + codigo
    novoBotao.setAttribute("cod", codigo)
    novoBotao.setAttribute("prereq", prereq)
    // Adicionar um evento de clique
    novoBotao.addEventListener("contextmenu", 
        (event) =>{
            contextMenuM(event,codigo,materia)
        })
    novoBotao.onclick = function() {
        let state = String(stateButton(novoBotao))

        let reativadoMouseleave = false
        if(mouseSobreBotaoDestacado() == false){
            tiraDestaqueBotoes();
            cancelaMouseLeave = false;
            reativadoMouseleave = true
            return
        }
        
        if(state.includes("Sem_pre")){
            if(state.includes("Ativo"))
                desativaButton(novoBotao)
            else ativaButton(novoBotao)
        }
        else{
            if(state.includes("Ativo"))
                disponibilizaButton(novoBotao)
            else if(state.includes("Dispo"))
                ativaButton(novoBotao)
            else{
                if(!reativadoMouseleave) cancelaMouseLeave = true
            }
        }

        updateButtons()
        if(todasMateriasDestacadasAtivas()){
            cancelaMouseLeave = false;
            reativadoMouseleave = true
        }
        
    };
   
    novoBotao.onmousemove = function() {
        if(cancelaMouseLeave) return
        
        destacarPrerequisito(novoBotao, 0)
        
    };
    novoBotao.onmouseleave = function() {
        if(cancelaMouseLeave) return
        
        tiraDestaqueBotoes()
    }

    prereq = String(prereq).trim()
    
    if (prereq.length < 3 && fase != "1"){
        //novoBotao.style.backgroundColor = "rgb(46, 204, 113)"
        novoBotao.style.borderColor = "rgb(255, 124, 0)"
    }

    if(fase == "1") disponibilizaButton(novoBotao)

    // Encontrar o elemento pai onde o botão será inserido
    const container = document.getElementById("divFase"+fase);

    // Adicionar o botão ao container
    container.appendChild(novoBotao);
}
function addFase(num){
    const novaDiv = document.createElement('div');

    novaDiv.id = "divFase"+num
    novaDiv.className = "fase"
    // Encontrar o elemento pai onde o botão será inserido
    const container = document.getElementById("fluxograma");

    // Adicionar o botão ao container
    container.appendChild(novaDiv);


    const novoBotao = document.createElement('button');

    // Definir o texto do botão
    

    novoBotao.textContent = num + '\u00ba Per\u00edodo'
    novoBotao.className = "btnFase"
    novoBotao.id = "btnFase" + num

    novoBotao.onclick = function() {
        
        const buttons = novaDiv.getElementsByClassName("btnMateria")
        
        let faseAtiva = false
        for (let i = 0; i < buttons.length; i++) {
            button = buttons[i]
            stateMateria = stateButton(button)
            if(stateMateria.includes("Ativo")){
                faseAtiva=true
                break
            }

        }

        for (let i = 0; i < buttons.length; i++) {
            button = buttons[i]
            stateMateria = stateButton(button)
            if(faseAtiva == false){
                if(stateMateria.includes("Sem_pre") || stateMateria.includes("Dispo")){
                    ativaButton(button)
                }
            }
            else{
                if(stateMateria.includes("Sem_pre")){
                    desativaButton(button)
                }
                else{
                    disponibilizaButton(button)
                }
            }
            

        }
        updateButtons()
        
    };

    novaDiv.appendChild(novoBotao)
}


function carregaCurriculo(curriculoFileName, botao) {

    try{
        document.getElementsByClassName("cursoAtivo")[0].classList.remove("cursoAtivo")
    }catch{}
    botao.classList.add("cursoAtivo")
    fluxogramaCarregado = false;  
    let curriculo = decoder.decode(new TextEncoder().encode(''));
    const container = document.getElementById("fluxograma");
    container.innerHTML = ""
    fetch('curriculos/'+curriculoFileName+".txt")
    .then(response => response.text())
    .then(text => {
        const decodedText = decoder.decode(new TextEncoder().encode(text));
        curriculo = decodedText;

        fases = curriculo.split("Fase ")
        fases.forEach((fase, nFase) => {
            if(nFase == 0) return;
            addFase(nFase)
            materias = fase.split("\n")
            materias.forEach((materia, index) => {
                if (index != 0 && materia[0] == 'E'){
                    cod = materia.split("|")[0]
                    nome = materia.split("|")[1]
                    prereq = materia.split("|")[2]
                    
                    addMateria(cod, nome, prereq,nFase)
                }
            });
        })
        fluxogramaCarregado = true;
    })
    document.getElementById("fluxograma").style.display = "flex"
    document.getElementById("cmdBar").style.display = "grid"

}

function mudarLayout(){
    const container = document.getElementById("fluxograma");
    if (container.classList.contains("lLarge")){
        container.classList.remove("lLarge")
        document.getElementById("btnTrocaLayout").textContent = "Layout Grande"
    }
    else {
        container.classList.add("lLarge")
        document.getElementById("btnTrocaLayout").textContent = "Layout Comprimido"
        
    }
}