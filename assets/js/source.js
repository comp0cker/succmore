var app = angular.module('app', []);
app.controller('ctrl', function ($scope) {
    function data(foo) {
        return foo;
    }

    // Hypergeometric JS from http://www.math.ucla.edu/~tom/distributions/Hypergeometric.html
    $scope.nn = 60; // 60 cards in deck
    $scope.n = 8; // 7 cards in starting hand + draw for turn
    $scope.x = 0; // We want the odds of getting 

    $scope.brigette = 2;
    $scope.lele = 3;
    $scope.ball = 4;
    $scope.myst = 0;

    $scope.total = function (variance) {
        var b = 0,
            l = 0,
            ba = 0,
            myst = 0;

        var ifBrigette = !($scope.brigette == "" || $scope.brigette == 0),
            ifLele = !($scope.lele == "" || $scope.lele == 0),
            ifBall = !($scope.ball == "" || $scope.ball == 0),
            ifTreasure = !($scope.myst == "" || $scope.myst == 0);
        // Accounts for if the field is left blank or inputted explicitly as 0
        // We could set the value to zero, but the way angular deals with setting the output to zero when backspaced is rather annoying

        if (ifBrigette)
            b = parseInt($scope.brigette);
        // If Brigette count is valid, set b (Brigette count) to user input
        // If it's not valid, b will stay equal to zero instead of trying to parseInt() ""

        if (ifBrigette && ifLele)
            l = parseInt($scope.lele);
        // If Lele count is valid, set l (Lele count) to user input
        // If it's not valid, l will stay equal to zero instead of trying to parseInt() ""

        if (ifBall && ifLele && ifBrigette)
            ba = parseInt($scope.ball);
        // If Ultra Ball count is valid, set ba (Ultra Ball count) to user input
        // If it's not valid, ba will stay equal to zero instead of trying to parseInt() ""
        
        if (ifTreasure && ifLele && ifBrigette)
            myst = parseInt($scope.myst);
    
        // If Treasure count is valid, set myst (Treasure count) to user input
        // If it's not valid, myst will stay equal to zero instead of trying to parseInt() ""

        var m = b + l + ba + myst;
        // m, the total valid sample size, is equal to the sum of the Brigette count, Lele count, Ultra Ball count, and Mystery Treasure count

        if (m)
            m += variance;
        // if m isn't zero, apply variance

        var odds = 1 - $scope.hyp($scope.x, $scope.n, m, $scope.nn);
        // Initial odds are the odds of having Brigette, Ultra Ball, or Tapu Lele-GX in starting hand

        if ($scope.brigette <= 6)
            odds -= (1 - $scope.hyp($scope.brigette, 6, $scope.brigette, 60));
        // Odds of prizing all Brigette

        if ($scope.lele > 1)
            odds -= ((1 - $scope.hyp($scope.lele, 7, m, 60)) * $scope.hyp($scope.lele - 1, 6, m, 60));
        // Odds of starting Lele and prizing the other(s)

        return (100 * odds).toFixed(2);
        // Return the odds in a percentage with floating point 2
    }

    $scope.hyp = function (x, n, m, nn) {
        // This algorithm is from https://gist.github.com/trevnorris/c39ac96740842e05303f
        // Implementation found at http://www.math.ucla.edu/~tom/distributions/Hypergeometric.html

        var nz, mz;
        // best to have n<m
        if (m < n) {
            nz = m;
            mz = n
        } else {
            nz = n;
            mz = m
        }
        var h = 1;
        var s = 1;
        var k = 0;
        var i = 0;
        while (i < x) {
            while (s > 1 && k < nz) {
                h = h * (1 - mz / (nn - k));
                s = s * (1 - mz / (nn - k));
                k = k + 1;
            }
            h = h * (nz - i) * (mz - i) / (i + 1) / (nn - nz - mz + i + 1);
            s = s + h;
            i = i + 1;
        }
        while (k < nz) {
            s = s * (1 - mz / (nn - k));
            k = k + 1;
        }
        return s;
    }
});
