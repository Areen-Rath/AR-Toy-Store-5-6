var houseNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (houseNumber === null) {
      this.askHouseNumber();
    }

    var toys = await this.getToys();

    this.el.addEventListener("markerFound", () => {
      if (houseNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askHouseNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";

    swal({
      title: "Welcome to Our Online Toy Shop!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your house number",
          type: "number",
          min: 1
        }
      }
    }).then(inputValue => {
      houseNumber = inputValue;
    });
  },

    handleMarkerFound: function (toys, markerId) {
        var toy = toys.filter(toy => toy.id === markerId)[0];
        var model = document.querySelector(`#model-${toy.id}`);

        model.setAttribute("visible", true);
        var detailsContainer = document.querySelector(
            `#main-plane-${toy.id}`
        );
        detailsContainer.setAttribute("visible", true);
        var pricePlane = document.querySelector(`#price-plane-${toy.id}`);
        pricePlane.setAttribute("visible", true);
        var ratingPlane = document.querySelector(`#rating-plane-${toy.id}`);
        ratingPlane.setAttribute("visible", true);
        var reviewPlane = document.querySelector(`#review-plane-${toy.id}`);
        reviewPlane.setAttribute("visible", true);
        var model = document.querySelector(`#model-${toy.id}`);
        model.setAttribute("position", toy.model_geometry.position);
        model.setAttribute("rotation", toy.model_geometry.rotation);
        model.setAttribute("scale", toy.model_geometry.scale);
        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "flex";
        var ratingButton = document.getElementById("rating-button");
        var orderButtton = document.getElementById("order-button");
        var orderSummaryButtton = document.getElementById("order-summary-button");
        var payButton = document.getElementById("pay-button");
        ratingButton.addEventListener("click", () => this.handleRatings(toy));
        orderButtton.addEventListener("click", () => {
            var hNumber;
            houseNumber <= 9 ? (hNumber = `H0${houseNumber}`) : `H${houseNumber}`;
            this.handleOrder(hNumber, toy);
            swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "Thanks For Order !",
            text: "Your order will arrive soon at your doorstep!",
            timer: 2000,
            buttons: false
            });
        });
        orderSummaryButtton.addEventListener("click", () =>
            this.handleOrderSummary()
        );
        payButton.addEventListener("click", () => this.handlePayment());
    },
  
  handleOrder: function (hNumber, toy) {
    firebase
      .firestore()
      .collection("houses")
      .doc(hNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][toy.id]) {
          details["current_orders"][toy.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][toy.id]["quantity"];

          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price;
        } else {
          details["current_orders"][toy.id] = {
            item: toy.toy,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }

        details.total_bill += toy.price;
        firebase
          .firestore()
          .collection("houses")
          .doc(doc.id)
          .update(details);
      });
  },
  getToys: async function () {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  getOrderSummary: async function (hNumber) {
    return await firebase
      .firestore()
      .collection("houses")
      .doc(hNumber)
      .get()
      .then(doc => doc.data());
  },
  handleOrderSummary: async function () {
    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    var tableBodyTag = document.getElementById("bill-table-body");

    tableBodyTag.innerHTML = "";

    var hNumber;
    houseNumber <= 9 ? (hNumber = `H0${houseNumber}`) : `H${houseNumber}`;

    var orderSummary = await this.getOrderSummary(hNumber);

    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {
      var tr = document.createElement("tr");
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      item.innerHTML = orderSummary.current_orders[i].item;
      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);
      tableBodyTag.appendChild(tr);
    });

    var totalTr = document.createElement("tr");

    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td2 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td3 = document.createElement("td");
    td1.setAttribute("class", "no-line text-cente");

    var strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";
    td3.appendChild(strongTag);

    var td4 = document.createElement("td");
    td1.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    tableBodyTag.appendChild(totalTr);
  },
  handlePayment: function () {
    document.getElementById("modal-div").style.display = "none";

    var hNumber;
    houseNumber <= 9 ? (hNumber = `T0${houseNumber}`) : `T${houseNumber}`;

    firebase
      .firestore()
      .collection("tables")
      .doc(hNumber)
      .update({
        current_orders: {},
        total_bill: 0
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks For Paying !",
          text: "We Hope You Enjoyed our Experience !!",
          timer: 2500,
          buttons: false
        });
      });
  },

  handleRatings: async function (toy) {
    var hNumber;
    houseNumber <= 9 ? (hNumber = `H0${houseNumber}`) : `H${houseNumber}`;
    var orderSummary = await this.getOrderSummary(hNumber);
    var currentOrders = Object.keys(orderSummary.current_orders);
    if (currentOrders.length > 0 && currentOrders === toy.id) {
      document.getElementById("rating-modal-div").style.display = "flex";
      document.getElementById("rating-input").value = "0";
      document.getElementById("feedback-input").value = "";
      var saveRatingButton = document.getElementById("save-rating-button");
      saveRatingButton.addEventListener("click", () => {
        document.getElementById("rating-modal-div").style.display = "none";
        var rating = document.getElementById("rating-input").value;
        var feedback = document.getElementById("feedback-input").value;
        firebase
          .firestore()
          .collection("toys")
          .doc(toy.id)
          .update({
            last_review: feedback,
            last_rating: rating
          })
          .then(() => {
            swal({
              icon: "success",
              title: "Thanks for Rating",
              text: "We hope you liked our toy",
              timer: 2500,
              button: false
            });
          });
      });
    } else {
      swal({
        icon: "warning",
        title: "Toy Not Found",
        text: "No toy found for rating",
        timer: 2500,
        button: false
      });
    }
  },
  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
