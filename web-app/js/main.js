/*price range*/
var app = angular.module('store', ['ngRoute']);

app.factory('thefactory', function ($http) {
    var factory = {};
    factory.products = {};
    $http.get('/api/products').success(function (data) {
        var list = data;
        list.forEach(function (e) {
            factory.products[e.id] = e;
        })
    });

    factory.cart_items = 0;
    factory.cart_amount = 0;
    factory.cart = [];
    factory.loggedIn = false;
    factory.user = "Maharshi Gor"
    factory.wishlist = [{
        'productId': 19,
        'name': 'Ronak',
        'description': 'TheBest',
        'image': 'images/home/image.jpg',
        'price': 100
    }];

    factory.setLoggedIn = function (value) {
        factory.loggedIn = value;
    }

    factory.changeQuantity = function (prodId, quantity) {
        console.log("Quantity Change");
        for (i = 0; i < factory.cart.length; i++) {
            if (factory.cart[i].productId == prodId) {
                if ((factory.cart[i].count + quantity) >= 0) {
                    factory.cart[i].count += quantity;
                    factory.cart[i].totCost = factory.cart[i].price * factory.cart[i].count;
                    factory.cart_amount = factory.cart_amount + (factory.cart[i].price * quantity);
                }
            }
        }
    };

    factory.setCartAmount = function () {
        return factory.cart_amount;
    }

    factory.findProduct = function (prodId) {
        return factory.products[prodId];
    }

    factory.addProdToCart = function (prodId, price, name, image) {
        factory.cart_amount = factory.cart_amount + price;
        factory.cart_items++;
        var find = 0;
        for (i = 0; i < factory.cart.length; i++) {
            if (factory.cart[i].productId == prodId) {
                find = 1;
            }
        }
        if (find == 1) {
            for (i = 0; i < factory.cart.length; i++) {
                if (factory.cart[i].productId == prodId) {
                    factory.cart[i].count++;
                    factory.cart[i].totCost = factory.cart[i].price * factory.cart[i].count;
                }
            }
            console.log("Match Found");
        }
        else {
            factory.cart.push({
                'productId': prodId,
                'price': price,
                'name': name,
                'count': 1,
                'image': image,
                'totCost': price
            });
            console.log("Match Not Found");
        }
    };
    return factory;
});

var categories = [{name: "Mobiles"}, {name: "Laptops"}, {name: "Accesories"}];

app.controller('HeaderController', function (thefactory) {
    this.cart_items = thefactory.cart_items;
});

app.controller('NavbarController', function ($scope, thefactory) {
    $scope.loggedIn = thefactory.loggedIn;
    console.log($scope.loggedIn);
    $scope.username = thefactory.user;
    console.log("Navbar Controller");
    $scope.logout = function () {
        $scope.loggedIn = false;
        thefactory.setLoggedIn(false);
    }
});

app.controller('CategoriesController', function (thefactory) {
    this.categories = categories;
});

app.controller('ListController', function ($scope, thefactory) {
    $scope.username = thefactory.user;
    $scope.logout = function () {
        $scope.loggedIn = false;
        thefactory.loggedIn();
    }
    $scope.products = thefactory.products;
    $scope.categories = thefactory.categories;
    $scope.loggedIn = thefactory.loggedIn;
    
    // $scope.addcart = function (a, b, c, d) {
    //     console.log("Add to cart called!");
    //     thefactory.addProdToCart(a, b, c, d);
    //     console.log(thefactory.cart_items);
    // };
    //
})

app.controller('CartController', function ($scope, thefactory) {
    $scope.list = thefactory.cart;

    $scope.cart_amount = thefactory.setCartAmount();
    $scope.increaseQuantity = function (a) {
        console.log("Quantity Change");
        thefactory.changeQuantity(a, 1);
        $scope.cart_amount = thefactory.setCartAmount();
    };

    $scope.decreaseQuantity = function (a) {
        console.log("Quantity Change");
        thefactory.changeQuantity(a, -1);
        $scope.cart_amount = thefactory.setCartAmount();
    };
})

app.controller('ProductController', function ($scope, thefactory, $routeParams) {
    this.product_id = $routeParams.id;
    this.loggedIn = thefactory.loggedIn;
    console.log(this.product_id);
    var product_id = Number(this.product_id);
    this.product = thefactory.findProduct(product_id);
    console.log(this.product)
    $scope.addcart = function (a, b, c, d) {
        console.log("Add to cart called!");
        thefactory.addProdToCart(a, b, c, d);
        console.log(thefactory.cart_items);
    };
})

app.controller('LoginController', function ($scope, thefactory) {
    var rootURL = "/choc/rest/api";

    $('#loginBtn').click(function () {
        console.log("Login Button Clicked");
        $scope.loginUser($('#emailId').val(), $('#password').val());
        return false;
    });

    $scope.loginUser = function (uname, pass) {
        console.log("Login Fuction Called");
        var item = {};
        item["username"] = uname;
        item["password"] = pass;
        var credentials = JSON.stringify(item);
        console.log(item['username'] + ' ' + item['password']);
        $.ajax({
            type: 'POST',
            url: rootURL + '/login',
            contentType: 'application/json',
            data: credentials,
            success: renderList
        });

        function renderList(data) {
            console.log("Got data");
            console.log(data);
            if (data['status'] == 'success') {
                thefactory.user = data['name'];
                thefactory.setLoggedIn(true);
            }
            console.log(thefactory.user);
            console.log(thefactory.loggedIn);
            location.href = "#/";
        }
    }

    $('#signupBtn').click(function () {
        console.log("Signup Button Clicked");
        signupUser($('#email').val(), $('#password2').val(), $('#fname').val(), $('#lname').val());
        console.log('pass: ' + $('#password2').val());
        return false;
    })

    function signupUser(email, pass1, fname, lname) {
        if (true) {
            var item = {};
            item['email_id'] = email;
            item['password'] = pass1;
            console.log(item['password']);
            item['firstname'] = fname;
            item['lastname'] = lname;
            item['contact_no'] = null;
            var jsonObj = JSON.stringify(item);
            $.ajax({
                type: 'POST',
                url: rootURL + '/signup',
                contentType: 'application/json',
                data: jsonObj
            });
        }
        else {
            console.log('password doesnt match:' + pass1 + ' ' + pass2)
        }

    }
})

app.config(function ($routeProvider) {
    $routeProvider
        .when('/',
            {
                controller: 'ListController',
                templateUrl: 'partials/startpage.html'
            })
        .when('/listing',
            {
                controller: 'ListController',
                templateUrl: 'partials/listing.html'
            })
        .when('/product/:id',
            {
                controller: 'ProductController',
                templateUrl: 'partials/product.html'
            })
        .when('/cart',
            {
                controller: 'CartController',
                templateUrl: 'partials/cart.html'
            })
        .when('/wishlist',
            {
                controller: 'WishlistController',
                templateUrl: 'partials/wishlist.html'
            })
        .when('/login',
            {
                templateUrl: 'partials/login.html'
            })
});

$('#sl2').slider();

var RGBChange = function () {
    $('#RGB').css('background', 'rgb(' + r.getValue() + ',' + g.getValue() + ',' + b.getValue() + ')')
};

/*scroll to top*/


$(document).ready(function () {
    $(function () {
        $.scrollUp({
            scrollName: 'scrollUp', // Element ID
            scrollDistance: 300, // Distance from top/bottom before showing element (px)
            scrollFrom: 'top', // 'top' or 'bottom'
            scrollSpeed: 300, // Speed back to top (ms)
            easingType: 'linear', // Scroll to top easing (see http://easings.net/)
            animation: 'fade', // Fade, slide, none
            animationSpeed: 200, // Animation in speed (ms)
            scrollTrigger: false, // Set a custom triggering element. Can be an HTML string or jQuery object
            //scrollTarget: false, // Set a custom target element for scrolling to the top
            scrollText: 'Cart', // Text for element, can contain HTML
            scrollTitle: false, // Set a custom <a> title if required.
            scrollImg: false, // Set true to use image
            activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
            zIndex: 2147483647 // Z-Index for the overlay
        });
    });
});

