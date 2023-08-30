/*
variaveis globais:
0: libera a passagem do estagio 3, derrotando os inimigos do 4 e do 5
*/
function GameManager(pc) {
    this.pc = pc;
    this.dungeonGenerator = new DungeonGenerator();
    this.estagios = [];
    this.criarEstagios();
    this.tema = new Audio();
    this.globalVar = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
}

/*modelo de mapa
mapa = new Grid({COLUMNS:12, LINES:10, assets: assetsMng, m:
        [
        [6,6,6,6,6,6,6,6,6,6,6,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,0,0,0,0,0,0,0,0,0,0,6],
        [6,6,6,6,6,6,6,6,6,6,6,6],
        ]
        });*/

//contem os dados de cada estágio do jogo
GameManager.prototype.criarEstagios = function(){
    var spriteLista = [];
    var eventoLista = [];
    //estagio 1
    var contador = 0;
    console.time('createMap');
    console.profile()
    var dungeonCriada = this.dungeonGenerator.createMap();
    while(!this.dungeonGenerator.sucesso){
        console.log("Erro no Kruskal")
        contador++
        this.dungeonGenerator.graph = new Graph();
        var dungeonCriada = this.dungeonGenerator.createMap();
        console.log("Quantidade de vezes que a dungeon foi refeita: "+contador)
    }
    console.profileEnd();

    console.timeEnd('createMap');

    const indiceAleatorio = Math.floor(Math.random() * this.dungeonGenerator.graph.adjacencyList.length);
    var x = this.dungeonGenerator.graph.adjacencyList[indiceAleatorio].cells[2].y
    var y = this.dungeonGenerator.graph.adjacencyList[indiceAleatorio].cells[2].x

    dungeonCriada[x][y] = 8
    mapa = new Grid({COLUMNS:this.dungeonGenerator.MAP_SIZE, LINES:this.dungeonGenerator.MAP_SIZE,
        assets: assetsMng, m: dungeonCriada});
    console.log("Kruskal com sucesso")
    /* // cria chave e porta
    spriteLista.push(this.criarChave(18, 18, 0));
    spriteLista.push(this.criarChave(18, 19, 1));
    spriteLista.push(this.criarChave(19, 19, 2));
    spriteLista.push(this.criarChave(19, 18, 3));
    spriteLista.push(this.criarPorta(y, x, 3));*/
    /* // cria a bota antilava
    spriteLista.push(this.criarBotaAntiLava(19, 20));  */

    pos1 = {x: x, y: y}

    var x = this.dungeonGenerator.graph.adjacencyList[indiceAleatorio > 0 ? 0 : 1].cells[2].y
    var y = this.dungeonGenerator.graph.adjacencyList[indiceAleatorio > 0 ? 0 : 1].cells[2].x
    
    pos2 = {x: x, y: y}

    coordenadas = [pos1, pos2]
    console.log(coordenadas)

    var evento = function() {
        cena1.map.cells[this.coordenadas[!this.toggled ? 1 :0].y][this.coordenadas[!this.toggled ? 1 : 0].x].tipo = 4
        cena1.map.cells[this.coordenadas[this.toggled ? 1 : 0].y][this.coordenadas[this.toggled ? 1 :0].x].tipo = 8
    }

    spriteLista.push(this.criarAlavanca(19, 19, evento, coordenadas));

    this.estagios.push(this.fabricaDeEstagios(mapa,spriteLista,eventoLista));

    // tela de game over

    mapa = new Grid({COLUMNS:12, LINES:10, assets: assetsMng, m:
        [
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        [9,9,9,9,9,9,9,9,9,9,9,9],
        ]
        });
    spriteLista = [];
    eventoLista = [];

    spriteLista.push(this.criarObjeto(3, 5.5, 4.5, 1));

    evento1 = function(){
        pc.comportar = function (){};
        pc.desenhar = function (){};
        cena1.dialogo = "Você perdeu! A pequena Lyra não consegue salvar seu pai..._Aperte F5 para reiniciar o jogo."
        gerenciador.tema.src = "assets/gameover.ogg";
        gerenciador.tema.loop = false;
        gerenciador.tema.play();

        var idx = cena1.estagio.eventos.indexOf(this);
        cena1.estagio.eventos.splice(idx);

    }

    eventoLista.push(evento1);
    this.estagios.push(this.fabricaDeEstagios(mapa,spriteLista,eventoLista));
}

//direcao => 0: baixo 1: esquerda, 2: direita, 3: cima
//cria um inimigo passando como parâmetro seu tipo e sua posição X e Y
GameManager.prototype.criarInimigo = function(tipo, posX, posY) {
    var inimigo;
    switch (tipo){
        //morcego
        case 0:
            inimigo = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm:40 + Math.random()*25, imgX:0, imgY:0, 
                imagem: "monster", comportar: persegue(this.pc), props: { tipo: "npc" }});
            break;
        //diabinho
        case 1:
            inimigo = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm:20, imgX:0, imgY:1, 
                imagem: "monster", comportar: persegue(this.pc), props: { tipo: "npc" }});
            break;
        //caveira
        case 2:
             inimigo = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm: 30, imgX:1, imgY:1, 
                imagem: "monster", comportar: persegue(this.pc), props: { tipo: "npc" }});
             break;
        //ogro
        case 3:
            inimigo = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm: 20, imgX:2, imgY:0, 
               vidas: 2, imagem: "monster", comportar: persegue(this.pc), props: { tipo: "npc" }});
            break;
        //touro a esquerda
        case 4:
            inimigo = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm: 0, imgX:3, imgY:0, vx:0, vy:0,
                direcao: 1, imagem: "monster", comportar: atirarRochas, props: { tipo: "npc" }});
            break;
        //touro a direita
        case 5:
            inimigo = new Sprite({ x: posX*32+26, y: posY*32+16, w: 12, h: 12, vm: 0, imgX:3, imgY:0, vx:0, vy:0,
                direcao: 2, imagem: "monster", comportar: atirarRochas, props: { tipo: "npc" }});
            break;
        //necromante
        case 7:
            inimigo = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm: 0, imgX:3, imgY:1, vx:0, vy:0, globalCD: 1.5,
                vidas: 2, imagem: "monster", comportar: necromancia, props: { tipo: "npc" }});
            break;
        // touro para baixo
        case 8:
            inimigo = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm: 0, imgX:3, imgY:0, vx:0, vy:0,
                direcao: 0, imagem: "monster", comportar: atirarRochas, props: { tipo: "npc" }});
            break;
    }
    return inimigo;
}


//cria estagios
GameManager.prototype.fabricaDeEstagios = function (map, spriteLista, eventoLista) {
    var estagio = {
        mapa: null,
        eventos: [],
        sprites: []
    }
    estagio.mapa = map;
    estagio.sprites = spriteLista;
    estagio.eventos = eventoLista;
    return estagio;
}

//cria objetos
GameManager.prototype.criarObjeto = function (numero, posX, posY, direct) {
    var objeto;
    switch (numero) {
        //gargula
        case 0:
            objeto = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm:0, direcao: direct, imgX:0, imgY:0, 
                imagem: "gargoyle", mover: moverObjeto, props: { tipo: "objeto" }});
            break;
        //lyra caida
        case 3:
            objeto = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm:0, direcao: 1, imgX:2, imgY:1, 
                imagem: "expressoes", mover: moverObjeto, props: { tipo: "objeto" }});
            break;
    }
    return objeto;
}

//cria poder de recuperar hp e mana
GameManager.prototype.criarPoder = function (numero, posX, posY) {
    var poder;
    switch (numero) {
        case 0:
            poder = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm:0, direcao: 0, imgX:numero, imgY: 1, 
                imagem: "crystal", desenhar: desenhaTiro, props: { tipo: "poder", modelo: "hp" }});
            break;
        case 1:
            poder = new Sprite({ x: posX*32+16, y: posY*32+16, w: 12, h: 12, vm:0, direcao: 0, imgX:numero, imgY: 1, 
                imagem: "crystal", desenhar: desenhaTiro, props: { tipo: "poder", modelo: "mana" }});
            break;
    }
    return poder;
}

//cria uma chave.
GameManager.prototype.criarChave = function (posX, posY, keyId) {
    return new Sprite({ x: posX*32+16, y: posY*32+16, w: 32, h: 32, spriteSize: 32, vm:0, imgX:0, imgY:0, keyId: keyId,
                imagem: "key_"+keyId, desenhar: desenharChave, props: { tipo: "objeto", subtipo: "colecionavel" }});
}

//cria uma porta.
GameManager.prototype.criarPorta = function (posX, posY, doorId) {
    return new Sprite({ x: posX*32+16, y: posY*32+16, posX: posX, posY: posY, w: 32, h: 32, vm:0, imgX:2, imgY:1, doorId: doorId,
                imagem: "door_"+doorId, desenhar: desenharPorta, props: { tipo: "objeto", subtipo: "porta" }});
}

GameManager.prototype.criarBotaAntiLava = function (posX, posY) {
    return new Sprite({ x: posX*32+16, y: posY*32+16, w: 32, h: 32, spriteSize: 16, vm:0, imgX:17, imgY:0,
                imagem: "gear", desenhar: desenharColecionavel, props: { tipo: "objeto", subtipo: "colecionavel", event: "lava" }});
}

GameManager.prototype.criarAlavanca = function (posX, posY, evento, coordenadas) {
    return new Sprite({ x: posX*32+16, y: posY*32+16, w: 32, h: 32, spriteSize: 48, vm:0, imgX:1, imgY:0, event: evento,
                imagem: "switch", desenhar: desenharAlavanca, coordenadas: coordenadas, toggled: false, props: { tipo: "objeto", subtipo: "alavanca" }});
}