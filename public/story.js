// Roteiro do Arco I — cenas cinematográficas. act: personagens em cena (sil = silhueta).
const BG = { ash: ['#140a0c', '#6a2c18'], blue: ['#060d1c', '#1f4278'], night: ['#04030a', '#2c1740'], ruin: ['#07100c', '#21402e'], gold: ['#16100a', '#7a5420'], day: ['#46688c', '#b8c8a0'] };
const CUTS = {
  prologue: { theme: 'sad', slides: [
    { bg: 'ash', who: 'Prólogo — Antes das cinzas', tx: 'Sete guardiões enfrentam uma criatura colossal. Um ergue uma espada em chamas. Uma mulher invoca ondas. Um elfo dispara uma flecha de luz. Um anão golpeia o chão com seu martelo.', beast: 1, act: [{ c: 'kael', x: 200, m: 'atk', sil: 1 }, { c: 'lyra', x: 300, m: 'cast', sil: 1 }, { c: 'eld', x: 400, m: 'atk', sil: 1 }, { c: 'tho', x: 500, m: 'atk', sil: 1 }] },
    { bg: 'blue', who: 'Prólogo — Antes das cinzas', tx: 'Dois outros usam forças que não conseguimos identificar. Uma sétima figura permanece distante, com uma luz azulada envolvendo seu corpo. Os sete se posicionam. Uma explosão de luz toma a tela.', beast: 1, flash: 1, act: [{ c: 'ser', x: 220, m: 'cast', sil: 1 }, { c: 'dar', x: 340, m: 'idle', sil: 1 }, { c: 'aur', x: 560, m: 'cast', sil: 1, sc: 1.2 }] },
    { bg: 'day', who: 'Narrador', tx: '"Os homens construíram reinos sobre as ruínas de uma guerra que já não lembram. Os nomes dos guardiões foram esquecidos. Suas armas desapareceram. E aquilo que foi selado permaneceu adormecido... Até agora."', title: 1, act: [] }] },
  night: { theme: 'night', slides: [
    { bg: 'night', who: 'A Noite dos Corrompidos', tx: 'Na terceira noite, o sino da praça começa a tocar. Animais fogem dos estábulos. Os cães latem. Uma névoa escura surge da floresta...', act: [{ c: 'kael', x: 250, m: 'idle' }, { c: 'lyra', x: 380, m: 'idle' }, { c: 'eld', x: 510, m: 'idle' }] },
    { bg: 'ash', who: 'A Noite dos Corrompidos', tx: 'Os primeiros monstros aparecem. Cada herói vê uma parte do ataque. Defenda o vilarejo!', beast: 1, act: [{ c: 'ser', x: 240, m: 'hurt' }, { c: 'dar', x: 380, m: 'idle' }, { c: 'tho', x: 520, m: 'idle' }] }] },
  awaken: { theme: 'sad', slides: [
    { bg: 'blue', who: 'Primeiro despertar', tx: 'No auge do ataque, cada herdeiro sente um poder explodir de dentro de si — chama, água, vento, sombra, pedra e metal. Ninguém entende de onde ele vem.', flash: 1, act: [{ c: 'kael', x: 200, m: 'cast' }, { c: 'lyra', x: 320, m: 'cast' }, { c: 'eld', x: 440, m: 'cast' }, { c: 'ser', x: 560, m: 'cast' }] },
    { bg: 'ruin', who: 'Capítulo II — O segredo sob a ponte', tx: 'A água contaminada vem de uma passagem sob a ponte antiga. Suas habilidades elementais foram liberadas! Siga até a ponte, ao sul do rio.', act: [{ c: 'dar', x: 300, m: 'idle' }, { c: 'tho', x: 460, m: 'idle' }] }] },
  boss: { theme: 'boss', slides: [
    { bg: 'ash', who: 'Câmara do Selo', tx: 'Uma criatura gigantesca ergue-se do chão. Era um guardião. Agora só repete: "Não... permitam... que o sétimo desperte..."', beast: 1, act: [] }] },
  ending: { theme: 'sad', slides: [
    { bg: 'ruin', who: 'Varkesh', tx: '"Os herdeiros... voltaram... Mas vocês não sabem o que estão carregando..." O núcleo se apaga.', act: [] },
    { bg: 'night', who: 'Epílogo', tx: 'Auren retorna sozinho à câmara. Passa a mão sobre as pedras e revela sete símbolos. Seis brilham. O sétimo permanece apagado. Ele tira do manto uma pedra azulada, que pulsa uma única vez.', act: [{ c: 'aur', x: 400, m: 'idle', sc: 1.1 }] },
    { bg: 'night', who: 'Auren', tx: '"Ainda não... Eles precisam compreender o que são antes de descobrir o que foram."  — Uma voz sussurra: "O selo está enfraquecendo, Auren."  — "Eu sei."', act: [{ c: 'aur', x: 400, m: 'cast', sc: 1.1 }] },
    { bg: 'gold', who: 'FIM DO ARCO I', tx: 'AS CINZAS DE VALDORA. Próximo: Arco II — A Cidadela Norte.', title: 1, act: [] }] }
};
