/*price range*/
var app = angular.module('store', ['ngRoute','ngStorage']);

app.controller('productService', function () {
    var products = [];
    var selectedProduct = null;
    var selectedCategory = null;
});

app.factory('appFactory', function ($http, $localStorage) {
    var factory = {};
    factory.feedback_sent = false;
    factory.products = {};
    factory.cart_items = 0;
    factory.cart_amount = 0;
    factory.cart = [];
    factory.user = $localStorage.user;
    factory.loggedIn = (factory.user != null);

    factory.setLoggedIn = function (value) {
        factory.loggedIn = value;
    };

    factory.changeQuantity = function (prodId, quantity) {
        console.log("Quantity Change");
        for (i = 0; i < factory.cart.length; i++) {
            if (factory.cart[i].productId == prodId) {
                if ((factory.cart[i].count + quantity) >= 0) {
                    factory.cart[i].count += quantity;
                    factory.cart[i].totCost = factory.cart[i].price * factory.cart[i].count;
                    factory.cart_amount = (parseFloat(factory.cart[i].price) * quantity) + parseFloat(factory.cart_amount);
                }
            }
        }
    };

    factory.getCartAmount = function () {
        return factory.cart_amount;
    }

    factory.findProduct = function (id) {
        return factory.products[id];
    }

    factory.resetCart = function () {
        factory.cart_items = 0;
        factory.cart_amount = 0;
        factory.cart = [];
    }

    factory.addProdToCart = function (id) {
        price = factory.products[id].sellPrice.toFixed(2);
        name = factory.products[id].name;
        factory.cart_amount = parseFloat(price) + factory.cart_amount;
        factory.cart_items++;
        var found = 0;
        for (i = 0; i < factory.cart.length && !found; i++) {
            if (factory.cart[i].productId == id) {
                found = 1;
                factory.cart[i].count++;
                factory.cart[i].totCost = parseFloat(factory.cart[i].price) * factory.cart[i].count;
            }
        }
        if(!found) {
            factory.cart.push({
                'productId': id,
                'price': price,
                'name': name,
                'count': 1,
                'image': "/images/img" + (id % 7) + ".jpg",
                'totCost': price
            });
            console.log("Match Not Found");
        }
        alert(name + " added to Cart")
    };
    return factory;
});

app.controller('HeaderController', function (appFactory) {
    this.cart_items = appFactory.cart_items;
});

app.controller('NavbarController', function ($scope, appFactory) {
    $scope.loggedIn = appFactory.loggedIn;
    console.log($scope.loggedIn);
    $scope.username = appFactory.user;
    console.log("Navbar Controller");
    $scope.logout = function () {
        $scope.loggedIn = false;
        appFactory.setLoggedIn(false);
    }
});

app.controller('ListController', function ($scope, appFactory, $http) {
    appFactory.feedback_sent = false;
    $scope.username = appFactory.user;
    $scope.loggedIn = appFactory.loggedIn;
    $scope.search = {};
    $scope.search.name = ""

    $scope.cart_count = function () {
        return appFactory.cart_items;
    };
    
    $scope.deselect = function() {
        $scope.search.name = ""
    }

    $scope.select = function(name) {
        $scope.search.name = name;
        console.log($scope.search.name)
    }

    $scope.logout = function () {
        $scope.loggedIn = false;
        appFactory.loggedIn();
    }

    $scope.categoriesByName = {};
    $scope.categoriesById = {};
    $scope.products = {};
    $http.get('/api/products/categories').success(function (data) {
        var list = data;
        list.forEach(function (e) {
            $scope.categoriesByName[e.name] = $scope.categoriesById[e.id] = {
                'id': e.id,
                'name': e.name,
                'count': 0
            };
        })
        console.log($scope.categoriesById);
        $http.get('/api/products').success(function (data) {
            var list = data;
            list.forEach(function (e) {
                console.log(e);
                e.image = "/images/img" + (e.id % 7) + ".jpg"
                e.cat_name = $scope.categoriesById[e.categoryID] ?  $scope.categoriesById[e.categoryID].name : "";
                $scope.categoriesById[e.categoryID] && ($scope.categoriesById[e.categoryID].count += 1);
                $scope.products[e.id] = e;
                appFactory.products[e.id] = e;
            })
        });
    });

    $scope.addcart = function (id) {
        console.log("Add to cart called!");
        console.log(appFactory.products)
        console.log('id' + id)
        appFactory.addProdToCart(id);
        console.log(appFactory.cart_items);
    };

})

app.controller('CartController', function ($scope, appFactory) {
    $scope.list = appFactory.cart;

    $scope.cart_count = function () {
        return appFactory.cart_items;
    }

    $scope.cart_amount = function () {
        return appFactory.getCartAmount();
    }

    $scope.increaseQuantity = function (a) {
        console.log("Quantity Change");
        appFactory.changeQuantity(a, 1);
        // $scope.cart_amount = appFactory.setCartAmount();
    };

    $scope.decreaseQuantity = function (a) {
        console.log("Quantity Change");
        appFactory.changeQuantity(a, -1);
        // $scope.cart_amount = appFactory.setCartAmount();
    };
})

app.controller('SubmitController', function ($scope, appFactory,$http) {
    $scope.order_summary = appFactory.cart;
    $scope.order_total = appFactory.cart_amount;
    $scope.submitted = false;

    success_msg = "Thank You For Shopping :)"
    failure_msg = "Something went wrong, Please try again :("

    $scope.orderTotal = function () {
        return appFactory.cart_amount;
    }

    $scope.clear_summary = function () {
        $scope.order_summary = []
        $scope.order_total = 0;
        $scope.submitted = false;
    }

    $scope.submit = function () {
        products = $scope.order_summary.map(function (e) {
            return {
                "product_id": e.productId,
                "qty": e.count,
                "sell_price": e.price
            }
        })
        console.log(products)
        data = {
            "user_name": $scope.username,
            "address": $scope.address,
            "contact": $scope.contact,
            "mode": "COD",
            "email": $scope.email,
            "products": products
        }
        console.log(data)

        $http({
            url: '/api/orders/submit',
            method: "POST",
            data: data
        }).then(function (response) {
            $scope.submitted = true;
            appFactory.resetCart()
            $scope.message = success_msg
        }, function (response) {
            $scope.submitted = true;
            $scope.message = failure_msg
        });
    }
    console.log($scope.order);
})

app.controller('ProductController', function ($scope, appFactory, $routeParams, $http) {
    this.product_id = $routeParams.id;
    $scope.product = {}
    $scope.product =  appFactory.findProduct(this.product_id);
    if($scope.product == null) {
        $http.get('/api/products/' + this.product_id).success(function (data) {
            $scope.product = data;
        });
    }

    this.loggedIn = appFactory.loggedIn;
    console.log(this.product_id);
    this.product_id = Number(this.product_id);

    $scope.addcart = function (id) {
        console.log("Add to cart called!");
        appFactory.addProdToCart(id);
        console.log(appFactory.cart_items);
    };

    $scope.cart_count = function () {
        return appFactory.cart_items;
    }

    $scope.selectProduct = function (id, price, name, image) {
        console.log("Add to cart called!");
        appFactory.addProdToCart(id, price, name, image);
        console.log(appFactory.cart_items);
    };
})

app.controller('FeedbackController', function ($scope, appFactory) {
    $scope.feedback_sent = function () {
        return appFactory.feedback_sent;
    }
    $scope.submit = function () {
        appFactory.feedback_sent = true;
    }
    $scope.msg = "Thank You for the feedback :)"
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
        .when('/checkout',
            {
                templateUrl: 'partials/checkout.html'
            })
        .when('/feedback',
            {
                controller: 'FeedbackController',
                templateUrl: 'partials/feedback.html'
            })
        .when('/error',
            {
                templateUrl: '404.html'
            })

});

$('#sl2').slider();

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
            animationSpeed: 100, // Animation in speed (ms)
            scrollTrigger: false, // Set a custom triggering element. Can be an HTML string or jQuery object
            //scrollTarget: false, // Set a custom target element for scrolling to the top
            scrollText: 'Shopping Cart', // Text for element, can contain HTML
            scrollTitle: false, // Set a custom <a> title if required.
            scrollImg: false, // Set true to use image
            activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
            zIndex: 2147483647 // Z-Index for the overlay
        });
    });
});

