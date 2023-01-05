AFRAME.registerComponent("button", {
    init: function() {
        var button1 = document.createElement("button");
        button1.innerHTML = "Order Summary";
        button1.setAttribute("id", "summary");
        button1.setAttribute("class", "btn btn-danger ml-3 mr-3")
        var button2 = document.createElement("button");
        button2.innerHTML = "Order Now";
        button1.setAttribute("id", "order");
        button1.setAttribute("class", "btn btn-danger ml-3 mr-3");
        var button3 = document.createElement("button");
        button3.innerHTML = "Order Summary";
        button3.setAttribute("id", "order-summary-button");
        button3.setAttribute("class", "btn btn-danger ml-3 mr-3");
        var buttonDiv = document.getElementById("button");
        buttonDiv.appendChild(button1);
        buttonDiv.appendChild(button2);
    }
});