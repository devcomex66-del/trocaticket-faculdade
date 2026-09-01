(function (global) {
  var KEY_CART = "trocaticket-cart";
  var KEY_PEDIDO = "trocaticket-pedido";

  var EVENTOS = [
    {
      id: "vinil",
      tag: "MÚSICA",
      nome: "Noite do Vinil",
      quando: "Sábado 20:00",
      local: "Salvador · Teatro do Campus",
      organizador: "Coletivo Agulha",
      lote: "Lote 2",
      preco: 48,
      busca: "noite do vinil salvador teatro dj",
      texto: "DJ set analógico, luz vermelha e pista de madeira. Ingresso digital com QR na entrada."
    },
    {
      id: "rock",
      tag: "SHOW",
      nome: "Rock no Porão",
      quando: "Sexta 22:00",
      local: "Salvador · Casa 78",
      organizador: "Casa 78",
      lote: "Últimas do lote",
      preco: 35,
      busca: "rock porão casa 78 show",
      texto: "Três bandas independentes. Transferência só pelo marketplace, se o organizador habilitar."
    },
    {
      id: "standup",
      tag: "COMÉDIA",
      nome: "Stand-up da Semana",
      quando: "Quinta 19:30",
      local: "Campus · Auditório B",
      organizador: "Atlética de Comunicação",
      lote: "Cortesia",
      preco: 0,
      busca: "standup comedia campus auditorio",
      texto: "Comédia universitária. Sessão gratuita nesta demonstração acadêmica."
    },
    {
      id: "feira",
      tag: "CAMPUS",
      nome: "Feira de Tecnologia",
      quando: "Sábado 09:00",
      local: "Pátio central",
      organizador: "Centro acadêmico",
      lote: "Credenciamento",
      preco: 12,
      busca: "feira tecnologia hacks campus",
      texto: "Credenciamento digital e pulseira na entrada. Vagas limitadas neste lote demo."
    },
    {
      id: "arraia",
      tag: "FESTA",
      nome: "Arraiá Universitário",
      quando: "Sábado 18:00",
      local: "Quadra coberta",
      organizador: "DCE",
      lote: "Lote 2",
      preco: 25,
      busca: "festa junina universidade forro arraia",
      texto: "Lote 1 esgotado. Transferência permitida no marketplace desta festa."
    },
    {
      id: "cine",
      tag: "CINEMA",
      nome: "Sessão Meia-Noite",
      quando: "Sábado 00:00",
      local: "Cineclube Vermelho",
      organizador: "Cineclube Vermelho",
      lote: "Poltrona marcada",
      preco: 22,
      busca: "cinema classico sessao meia noite",
      texto: "Poltrona marcada no ingresso digital. Chegue antes da meia-noite."
    }
  ];

  function brl(n) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(KEY_CART);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(KEY_CART, JSON.stringify(items));
    paintCartCount();
  }

  function cartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + item.qtd;
    }, 0);
  }

  function cartTotal() {
    return getCart().reduce(function (sum, item) {
      var ev = byId(item.id);
      return sum + (ev ? ev.preco * item.qtd : 0);
    }, 0);
  }

  function byId(id) {
    return EVENTOS.filter(function (e) {
      return e.id === id;
    })[0];
  }

  function addToCart(id, qtd) {
    qtd = Math.max(1, parseInt(qtd, 10) || 1);
    var ev = byId(id);
    if (!ev) return false;
    var cart = getCart();
    var found = cart.filter(function (i) {
      return i.id === id;
    })[0];
    if (found) found.qtd += qtd;
    else cart.push({ id: id, qtd: qtd });
    setCart(cart);
    return true;
  }

  function setQty(id, qtd) {
    qtd = parseInt(qtd, 10) || 0;
    var cart = getCart()
      .map(function (i) {
        if (i.id === id) i.qtd = qtd;
        return i;
      })
      .filter(function (i) {
        return i.qtd > 0;
      });
    setCart(cart);
  }

  function paintCartCount() {
    var n = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(n);
    });
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function ticketCode() {
    return "TT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  global.TT = {
    EVENTOS: EVENTOS,
    brl: brl,
    getCart: getCart,
    setCart: setCart,
    cartCount: cartCount,
    cartTotal: cartTotal,
    byId: byId,
    addToCart: addToCart,
    setQty: setQty,
    paintCartCount: paintCartCount,
    param: param,
    ticketCode: ticketCode,
    KEY_PEDIDO: KEY_PEDIDO
  };

  document.addEventListener("DOMContentLoaded", paintCartCount);
})(window);
