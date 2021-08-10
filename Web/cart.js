var xCart = document.getElementById('view-cart');

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready();
    xCart.style.display = "none";
}

function ready() {
    //using by class name because it returns an html collection
    var addItem = document.getElementsByClassName('addToCart');
    var removeItem = document.getElementsByClassName('remove');
    var updateQuantity = document.getElementsByClassName('quantity');
    var openAbout = document.getElementById('about')

    //looping through the buttons with the same class name
    for (var i = 0; i < addItem.length; i++) {
        var button = addItem[i];
        button.addEventListener('click', addToCart);            //call function on click
    }
    for (var i = 0; i < removeItem.length; i++) {
        var rvmBtn = removeItem[i];
        rvmBtn.addEventListener('click', removeItemFromCart);   //call function on click
    }

    for (var i = 0; i < updateQuantity.length; i++) {
        var updateQ = updateQuantity[i];
        updateQ.addEventListener('change', updateFoodQuantity)  //call function on change
    }

    //purchase button on click, call checkout function to clear the cart
    document.getElementsByClassName('check-out')[0].addEventListener('click', Checkout);
    openAbout.addEventListener('click', OpenAbout);
}
function OpenAbout(){
    const about_us = document.getElementById('about_us');
    about_us.style.display = "block";
}
function updateFoodQuantity(event) {
    var amount = event.target;
    if (isNaN(amount.value)) {  //check if quantity not a number then assign 1 to it
        amount.value = 1;
    }
    updateCart();  
}

var stripeHandler = StripeCheckout.configure({
    key: stripePKey,
    locale: 'auto', 
    token: function(token) {
        //once the purchase btn has been submitted, this will send the info to stripe for verification. stripe will send back the outcome
        var items = []; //creating empty array to hold all the items
        var itemContainer = document.getElementsByClassName('view-cart')[0];
        var cartRow = itemContainer.getElementsByClassName('cart-row');
        
        for (var i = 0; i < cartRow.length; i++) {
            var individualCartRow = cartRow[i];
            var quantityElement = individualCartRow.getElementsByClassName('quantity')[0];
            var quantity = quantityElement.value;   //getting the value of the quantity and assign it to a a var
            var id = individualCartRow.dataset.itemId;   //getting row id
            items.push({//adding item to array
                id: id,     //adding id and quantity to array to be sent to body
                quantity: quantity
            })
        }
        fetch('/purchase', {     //using fetch to send/request to a server async 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', //sending json content type
                'Accept': 'application/json'        //receiving json type
            },
            body: JSON.stringify({
                stripeTokenID: token.id,        //sending token to body
                items: items                    //sending items to body
            })
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            while (cartRow.length > 0) { //removing item from cart after payment has been completed
                cartRow[0].remove();
            }
            updateCart();
            alert(data.message);    //showing alert message from server
        }).catch(function(error){ //catch error
            console.log(error);
        })
    }
})

function Checkout() {
    //looping through and find all elements with class name cart-row and remove it from the order
    var priceElement = document.getElementsByClassName('total')[0];
    var price = parseFloat(priceElement.innerText.replace('Total: $ ', '')) * 100;
    stripeHandler.open({
        amount: price
    })
}

function removeItemFromCart(event) {
    var btnClicked = event.target;
    btnClicked.parentElement.remove();  //remove item from order card using remove function
    updateCart();
}

function addToCart(event) {
    //getting the div for the button add to cart button (the parent div)
    var btn = event.target;
    var shopItem = btn.parentElement;
    var foodName = shopItem.getElementsByClassName("food-name")[0].innerText;   //getting the name of the food
    var cost = shopItem.getElementsByClassName('cost')[0].innerText;        //getting the cost of the food
    var id = shopItem.dataset.itemId;//getting item id from json file > .dataset allows me to access all the data on html elements
    displayItemToCart(foodName, cost, id);  //display the name and the cost in cart div
    updateCart();
}

function updateCart() {
    //get element by class name returns an array of element. Only get the first element by using [0]
    var mainCart = document.getElementsByClassName('view-cart')[0];
    var rowItem = mainCart.getElementsByClassName('cart-row');
    var total = 0;

    for (var i = 0; i < rowItem.length; i++) {
        var cartRow = rowItem[i];
        var foodPrice = cartRow.getElementsByClassName('cost')[0];
        var foodQuantity = cartRow.getElementsByClassName('quantity')[0];
        var priceText = parseFloat(foodPrice.innerText.replace("$", ''));   //replace dollar sign with nothing
        var quantityAmount = foodQuantity.value;    //getting the value of quantity
        total = total + (priceText * quantityAmount);
    }
    //rounding total to nearest 2decimal places
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('total')[0].innerText = "Total: $ " + total;

}
function displayItemToCart(foodName, cost, id) {
    //adding item to cart div
    var cartRow = document.createElement('div');
    cartRow.classList.add('cart-row');      //adding class called cart row
    cartRow.dataset.itemId = id;    //assigning id to cart-row
    var cartItem = document.getElementsByClassName('view-cart')[0];     //getting elements in cart
    var checkName = cartItem.getElementsByClassName('food-name');   //getting the name of the food in the cart
    
    //checking for item name to see if it already exist, if so alert the user that the item already existed.
    for (var i = 0; i < checkName.length; i++) {
        if (checkName[i].innerText == foodName) {
            alert("Item is already in the cart");
            return;
        }
    }
    var itemContents = `<div class="ordered-food-item">
                        <strong class="food-name">${foodName}</strong>
                        <span class="cost">${cost}</span>
                        <input type="number" value= "1" min="1" class="quantity class="quantity">
                        <button class="remove">Remove</button>
                        </div>`;
    //using inerhtml to get the html context of an element node.
    cartRow.innerHTML = itemContents;

    //appending cart row to the end of cartItem
    cartItem.append(cartRow);
    cartRow.getElementsByClassName('remove')[0].addEventListener('click', removeItemFromCart);  //calling function from cart
    cartRow.getElementsByClassName('quantity')[0].addEventListener('change', updateFoodQuantity);
}

function showCart() {
    //using elementbyID because it returns a single DOM element
    var myCart = document.getElementsByClassName('view-cart')[0];
    var checkCart = myCart.getElementsByClassName('cart-row')[0];

    if (checkCart == undefined) {
        alert("Your cart is empty");
        xCart.style.display = "none";
    } else {
        if (xCart.style.display === "none") {
            xCart.style.display = "block";
        } else {
            xCart.style.display = "none";
        }
    }
}

const close_about = document.getElementById('close-about').addEventListener('click', CloseAbout)

function CloseAbout(){
    const about_us = document.getElementById('about_us');
    about_us.style.display = "none";
}
