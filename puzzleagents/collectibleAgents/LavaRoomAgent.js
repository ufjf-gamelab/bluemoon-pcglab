class LavaRoomAgent {
    constructor() {
        this.hasBoots = false
        this.defaultTag = { tipo: "colecionável", subTipo: "LavaRoomAgent" }
        this.restricao = { tipo: "LavaRoomAgent" }
    }

    gerarTag(mapGraph, room) {
        var lavaRoom = room
        if(this.hasBoots) {
            if(mapGraph.getNeighbors(room).some(neighbor => {return neighbor.tag.auxiliar === "LavaRoomAgent" || neighbor.tag.subTipo === "LavaRoomAgent"}) ||
            mapGraph.getNeighbors(room).length == 1 || Object.keys(room.tag).length > 0) {
                return false
            }
            lavaRoom = room

        } else {
            var lastTag = JSON.parse(JSON.stringify(room.tag))
            var startRoom = mapGraph.nodes.filter(node => node.tag.tipo === "inicio")[0]
            room.tag = JSON.parse(JSON.stringify(this.defaultTag  ))
            var collectible = mapGraph.nodes.filter(node => node.tag.tipo === "colecionável")
            var validRooms = mapGraph.nodes
            .filter(node => {return !mapGraph.getNeighbors(node).some(node => {return node.tag.auxiliar === "LavaRoomAgent"})})
            .filter(node => {return !mapGraph.getNeighbors(node).some(node => {return node.tag.subTipo === "LavaRoomAgent"})})
            .filter(node => {return Object.keys(node.tag).length == 0})
            .filter(node => {return mapGraph.getNeighbors(node).length > 1})
            .filter(node => {return mapGraph.findCollectibleRoomsInPathByRoom(startRoom, node).length == collectible.length})
            if(validRooms.length == 0){
                room.tag = lastTag
                return false
            }
            lavaRoom = validRooms[Math.floor(Math.random() * validRooms.length)];
            this.positionLavaBoots(room)
            this.hasBoots = true

        }

        lavaRoom.tag = { auxiliar: "LavaRoomAgent" }
        lavaRoom.restricoes.push(JSON.parse(JSON.stringify(this.restricao)))
        this.fillRoomInteriorWithLava(lavaRoom.cells);
        this.createLavaRemoverDevice(lavaRoom)
        return true
    }

    fillRoomInteriorWithLava(cells) {
        for (const cell of cells) {
            if (gerenciador.estagios[0].mapa.cells[cell.x][cell.y].tipo != 6) {
                gerenciador.estagios[0].mapa.cells[cell.x][cell.y].tipo = 5; // Lava tile
            }
        }
    }

    positionLavaBoots(node) {
        var posicao = this.calcularPosicaoMedia(node.roomHeight, node.roomWidth)
        node.tag.collectible = gerenciador.criarBotaAntiLava(Math.floor(posicao.x / 32) + node.cells[0].x, Math.floor(posicao.y / 32) + node.cells[0].y)
        //cena1.adicionar(gerenciador.criarBotaAntiLava(Math.floor(posicao.x / 32) + node.cells[0].x, Math.floor(posicao.y / 32) + node.cells[0].y))
    }

    calcularPosicaoMedia(rows, cols) {

        const posicaoMedia = {
            x: (cols / 2) * 32,
            y: (rows / 2) * 32
        };

        return posicaoMedia;
    }

    createLavaRemoverDevice(room) {
        var posicao = this.calcularPosicaoMedia(room.roomHeight, room.roomWidth)
        cena1.adicionar(gerenciador.criarDispositivoAntiLava(posicao.x + room.cells[0].x * 32, posicao.y + (room.cells[0].y + 2) * 32, this.lavaRemoverEvent, room))

    }

    lavaRemoverEvent() {
        this.toggled = !this.toggled;
        cena1.assets.play("water");
        for (const cell of this.room.cells) {
            if (gerenciador.estagios[0].mapa.cells[cell.x][cell.y].tipo != 6) {// Lava tile
                gerenciador.estagios[0].mapa.cells[cell.x][cell.y].tipo = 2;
            }
        }
        this.event = function () {}
    }

    verificarRestricoes(collectible, restricao) {
        var r = restricao.restricoes.find(r => {return r.tipo == collectible.subTipo})
        if(r != null) {
            var idx = restricao.restricoes.indexOf(r)
            restricao.restricoes.splice(idx, 1)
        }
    }

    gerarAgenteAuxiliar(room, collectible) {
        if(collectible){
            var position = { x: (room.cells[0].x + room.roomWidth / 2) * 32, y: (room.cells[0].y + room.roomHeight / 2) * 32 };
            collectible.x = position.x
            collectible.y = position.y
    
            cena1.adicionar(collectible)
        }
    }

}