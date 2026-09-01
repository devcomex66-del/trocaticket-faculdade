(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (header && toggle) {
    toggle.addEventListener("click", function () {
      const open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const search = document.querySelector("#busca-evento");
  if (search) {
    search.addEventListener("input", function () {
      const q = search.value.toLowerCase().trim();
      document.querySelectorAll("[data-evento]").forEach(function (card) {
        const hay = card.getAttribute("data-evento") || "";
        card.style.display = hay.toLowerCase().includes(q) ? "" : "none";
      });
    });
  }

  const form = document.querySelector("#contato-form");
  const flash = document.querySelector("#flash");
  if (form && flash) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      flash.classList.add("show");
      form.reset();
    });
  }

  const cartaz = document.querySelector("#cartaz");
  if (cartaz && window.TT) {
    cartaz.innerHTML = TT.EVENTOS.map(function (ev) {
      return (
        '<article class="ticket" data-evento="' +
        ev.busca +
        '">' +
        '<span class="tag">' +
        ev.tag +
        "</span>" +
        "<h3>" +
        ev.nome +
        "</h3>" +
        '<p class="meta">' +
        ev.quando +
        " · " +
        ev.local +
        "</p>" +
        "<p>" +
        ev.texto +
        "</p>" +
        '<p class="price">' +
        TT.brl(ev.preco) +
        "</p>" +
        '<a class="btn" href="evento.html?id=' +
        ev.id +
        '">Comprar</a>' +
        "</article>"
      );
    }).join("");
  }

  const ficha = document.querySelector("#ficha-evento");
  if (ficha && window.TT) {
    const ev = TT.byId(TT.param("id") || "");
    if (!ev) {
      ficha.innerHTML =
        "<p>Evento não encontrado nesta demo. <a href='eventos.html'>Voltar ao cartaz</a>.</p>";
    } else {
      ficha.innerHTML =
        '<span class="tag">' +
        ev.tag +
        "</span>" +
        "<h2>" +
        ev.nome +
        "</h2>" +
        '<p class="meta">' +
        ev.quando +
        " · " +
        ev.local +
        "</p>" +
        "<p>Organizador: " +
        ev.organizador +
        " · " +
        ev.lote +
        "</p>" +
        "<p>" +
        ev.texto +
        "</p>" +
        '<p class="price">' +
        TT.brl(ev.preco) +
        "</p>" +
        '<form id="form-compra">' +
        '<label class="qty">Quantidade <input name="qtd" type="number" min="1" max="8" value="1"></label>' +
        '<div class="actions" style="justify-content:flex-start">' +
        '<button class="btn" type="submit" name="acao" value="carrinho">Por no carrinho</button>' +
        '<button class="btn ghost" type="submit" name="acao" value="agora">Comprar agora</button>' +
        "</div></form>" +
        '<p class="note">Pagamento simulado — nenhum cartão ou PIX real é cobrado.</p>';
      document.querySelector("#form-compra").addEventListener("submit", function (e) {
        e.preventDefault();
        const qtd = e.target.qtd.value;
        const acao = (e.submitter && e.submitter.value) || "carrinho";
        TT.addToCart(ev.id, qtd);
        if (acao === "agora") location.href = "checkout.html";
        else location.href = "carrinho.html";
      });
    }
  }

  const listaCarrinho = document.querySelector("#lista-carrinho");
  if (listaCarrinho && window.TT) {
    function renderCart() {
      const items = TT.getCart();
      if (!items.length) {
        listaCarrinho.innerHTML =
          "<p>O guichê está vazio. <a href='eventos.html'>Escolher eventos</a>.</p>";
        document.querySelector("#cart-acoes").hidden = true;
        return;
      }
      document.querySelector("#cart-acoes").hidden = false;
      listaCarrinho.innerHTML = items
        .map(function (item) {
          const ev = TT.byId(item.id);
          if (!ev) return "";
          return (
            '<div class="cart-row" data-id="' +
            ev.id +
            '">' +
            "<div><strong>" +
            ev.nome +
            "</strong><p class='meta'>" +
            ev.quando +
            "</p></div>" +
            '<input class="tiny" type="number" min="0" max="8" value="' +
            item.qtd +
            '">' +
            "<div>" +
            TT.brl(ev.preco * item.qtd) +
            "</div>" +
            "</div>"
          );
        })
        .join("");
      document.querySelector("#cart-total").textContent = "Total: " + TT.brl(TT.cartTotal());
      listaCarrinho.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("change", function () {
          const id = input.closest(".cart-row").getAttribute("data-id");
          TT.setQty(id, input.value);
          renderCart();
        });
      });
    }
    renderCart();
    const limpar = document.querySelector("#limpar-carrinho");
    if (limpar) {
      limpar.addEventListener("click", function () {
        TT.setCart([]);
        renderCart();
      });
    }
  }

  const checkout = document.querySelector("#checkout-form");
  if (checkout && window.TT) {
    const items = TT.getCart();
    const resumo = document.querySelector("#checkout-resumo");
    if (!items.length) {
      resumo.innerHTML = "<p>Nada no carrinho. <a href='eventos.html'>Ir ao cartaz</a>.</p>";
      checkout.hidden = true;
    } else {
      resumo.innerHTML =
        items
          .map(function (item) {
            const ev = TT.byId(item.id);
            return ev ? "<p>" + item.qtd + "× " + ev.nome + " — " + TT.brl(ev.preco * item.qtd) + "</p>" : "";
          })
          .join("") + '<p class="total-line">' + TT.brl(TT.cartTotal()) + "</p>";
    }

    const pixBox = document.querySelector("#box-pix");
    const cardBox = document.querySelector("#box-cartao");
    checkout.querySelectorAll('[name="pagamento"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        pixBox.hidden = radio.value !== "pix";
        cardBox.hidden = radio.value !== "cartao";
      });
    });

    checkout.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!TT.getCart().length) return;
      const data = new FormData(checkout);
      const pedido = {
        codigo: TT.ticketCode(),
        nome: data.get("nome"),
        email: data.get("email"),
        pagamento: data.get("pagamento"),
        total: TT.cartTotal(),
        itens: TT.getCart(),
        quando: new Date().toLocaleString("pt-BR")
      };
      localStorage.setItem(TT.KEY_PEDIDO, JSON.stringify(pedido));
      TT.setCart([]);
      location.href = "ingresso.html";
    });
  }

  const ingresso = document.querySelector("#ingresso-lista");
  if (ingresso && window.TT) {
    const raw = localStorage.getItem(TT.KEY_PEDIDO);
    if (!raw) {
      ingresso.innerHTML = "<p>Nenhum pedido neste aparelho. <a href='eventos.html'>Comprar ingresso</a>.</p>";
    } else {
      const pedido = JSON.parse(raw);
      document.querySelector("#pedido-meta").textContent =
        "Pedido " + pedido.codigo + " · " + pedido.quando + " · " + pedido.nome;
      ingresso.innerHTML = pedido.itens
        .map(function (item) {
          const ev = TT.byId(item.id);
          if (!ev) return "";
          var html = "";
          for (var i = 0; i < item.qtd; i++) {
            html +=
              '<article class="ingresso"><div class="ingresso-body">' +
              '<span class="tag">' +
              ev.tag +
              "</span><h3>" +
              ev.nome +
              "</h3>" +
              '<p class="meta">' +
              ev.quando +
              " · " +
              ev.local +
              "</p>" +
              "<p>Titular: " +
              pedido.nome +
              "</p>" +
              "<p>Lote: " +
              ev.lote +
              " · " +
              TT.brl(ev.preco) +
              "</p>" +
              "<p>Código: " +
              pedido.codigo +
              "-" +
              (i + 1) +
              "</p></div>" +
              '<div class="qr-fake" aria-hidden="true"><span>QR</span></div></article>';
          }
          return html;
        })
        .join("");
    }
  }
})();
