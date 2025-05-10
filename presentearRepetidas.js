"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var users, figurinhas, _i, users_1, user, sorteadas, indicesUsados, idx, _a, sorteadas_1, figurinha, userFigurinha;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, prisma.user.findMany()];
                case 1:
                    users = _e.sent();
                    return [4 /*yield*/, prisma.figurinha.findMany({
                            where: {
                                raridade: { in: ['Prata', 'Ouro'] }
                            },
                            include: {
                                jogador: {
                                    include: {
                                        time: true
                                    }
                                }
                            }
                        })];
                case 2:
                    figurinhas = _e.sent();
                    if (figurinhas.length < 3) {
                        throw new Error('Não há figurinhas suficientes de Prata/Ouro para presentear!');
                    }
                    _i = 0, users_1 = users;
                    _e.label = 3;
                case 3:
                    if (!(_i < users_1.length)) return [3 /*break*/, 12];
                    user = users_1[_i];
                    sorteadas = [];
                    indicesUsados = new Set();
                    while (sorteadas.length < 3) {
                        idx = Math.floor(Math.random() * figurinhas.length);
                        if (!indicesUsados.has(idx)) {
                            sorteadas.push(figurinhas[idx]);
                            indicesUsados.add(idx);
                        }
                    }
                    _a = 0, sorteadas_1 = sorteadas;
                    _e.label = 4;
                case 4:
                    if (!(_a < sorteadas_1.length)) return [3 /*break*/, 10];
                    figurinha = sorteadas_1[_a];
                    return [4 /*yield*/, prisma.userFigurinha.findFirst({
                            where: {
                                userId: user.id,
                                figurinhaId: figurinha.id
                            }
                        })];
                case 5:
                    userFigurinha = _e.sent();
                    if (!userFigurinha) return [3 /*break*/, 7];
                    // Se já tem, aumenta a quantidade para garantir que seja repetida
                    return [4 /*yield*/, prisma.userFigurinha.update({
                            where: { id: userFigurinha.id },
                            data: { quantidade: userFigurinha.quantidade + 1 }
                        })];
                case 6:
                    // Se já tem, aumenta a quantidade para garantir que seja repetida
                    _e.sent();
                    return [3 /*break*/, 9];
                case 7: 
                // Se não tem, cria com quantidade 2 (uma original + uma repetida)
                return [4 /*yield*/, prisma.userFigurinha.create({
                        data: {
                            userId: user.id,
                            figurinhaId: figurinha.id,
                            quantidade: 2,
                            nomeJogador: ((_b = figurinha.jogador) === null || _b === void 0 ? void 0 : _b.nome) || '',
                            nomeTime: ((_d = (_c = figurinha.jogador) === null || _c === void 0 ? void 0 : _c.time) === null || _d === void 0 ? void 0 : _d.nome) || ''
                        }
                    })];
                case 8:
                    // Se não tem, cria com quantidade 2 (uma original + uma repetida)
                    _e.sent();
                    _e.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 4];
                case 10:
                    console.log("Usu\u00E1rio ".concat(user.email, " presenteado com 3 figurinhas repetidas!"));
                    _e.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 3];
                case 12: return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () {
    console.log('Todos os usuários foram presenteados!');
    return prisma.$disconnect();
})
    .catch(function (e) {
    console.error(e);
    return prisma.$disconnect();
});
