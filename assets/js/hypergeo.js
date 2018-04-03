var app = angular.module('app', []);
app.controller('ctrl', function ($scope) {
    function data(foo) {
        return foo;
    }

    // Hypergeometric JS from http://www.math.ucla.edu/~tom/distributions/Hypergeometric.html
    $scope.nn = 60; // 60 cards in deck
    $scope.n = 8; // 7 cards in starting hand + draw for turn
    $scope.x = 0; // We want the odds of getting 
    
    /*
    Turn One Brigette Calculation
    Everything between calculators stays in the same scopes,
    but we want to be careful so they don't overlap
    */

    $scope.brigette = 2;
    $scope.lele = 3;
    $scope.ball = 4;
    $scope.myst = 0;
    // Initialization of the variables for Brigette Lele, Ultra Ball, and Mystery Treasure counts.

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
    
    /*
    Prize Calculator
    Lots of different variables are implemented, which all correspond with HTML... I promise
    */
    $scope.numPrize = 1;
    $scope.numPlayed = 4;
    // These are for Odds of prizing ___ a card you play ___ of
    
    $scope.basic = 4;
    $scope.stageone = 3;
    // Odds of getting out n stage ones
    
    $scope.basic_three = 4;
    $scope.stageone_three = 2;
    $scope.stagetwo_three = 4;
    // Odds of getting out n stage twos
    $scope.rarecandies = 4;
    
    $scope.outsStageOne = function() {
        // Odds of getting out n stage ones
        // Basics and Stage 1s are included
        
        var str = "";
        // The output
        
        var probBasicPrized = 0;
        // Probability of your basic being prized
        
        var probStageOnePrized = 0;
        // Probability of your stage one being prized
        
        for (var i = 1; i <= 4; i++) {
        // How many to be "got out"
            if (i <= Math.min($scope.basic, $scope.stageone)) { // You can only get out as many stage ones as you play stage ones (or basics)
                
                probBasicPrized = $scope.noncummhyp(i, 54, 4, 60);
                // Adds the probability of 1 basic prized, 2 basics prized, etc.
                
                probStageOnePrized = $scope.noncummhyp(i, 54, 4, 60);
                // Adds the probability of 1 stage one prized, etc.
                // Same as basics algorithm
                
                var prob = 1 - (probBasicPrized + probStageOnePrized - probBasicPrized * probStageOnePrized);
                // The total probability is the addition of the two minus the product
                // flipped at the very end
                
                prob = prob.toFixed(4);
                
                str += prob * 100 + "% chance of getting " + i + " out." +  "\t";
            }
        }
        
        return str;
    }
    
    $scope.prized = function() {
        return ($scope.noncummhyp(Math.min($scope.numPrize, $scope.numPlayed), 6, Math.min($scope.numPlayed, 60), 60) * 100).toFixed(6);
    }
    
    $scope.outsStageTwo = function() {
        // Odds of getting out n stage twos
        
        var str = "";
        // The output
        
        var probBasicPrized = 0;
        // Probability of your basic being prized
        
        var probStageOnePrized = 0;
        // Probability of your stage one being prized
        
        var probStageTwoPrized = 0;
        // Probability of your stage two being prized
        
        var probCandyPrized = 0;
        // Probability of your candy being prized
        
        for (var i = 1; i <= 4; i++) {
        // How many to be "got out"
            var minStageTwo = Math.min($scope.rarecandies, $scope.stagetwo_three);
            // How many "stage twos" there are depends first on the candy count
            
            var minGettingOutStageTwo = Math.max(minStageTwo, $scope.stageone_three)
            // also depends on how many stage ones you play
            
            var minTotal = Math.min(minGettingOutStageTwo, $scope.basic_three)
            
            if (i <= minTotal) { // You can only get out as many stage ones as you play stage ones (or basics)
                
                probBasicPrized = $scope.noncummhyp(i, 54, 4, 60);
                // Adds the probability of 1 basic prized, 2 basics prized, etc.
                
                probStageOnePrized = $scope.noncummhyp(i, 54, 4, 60);
                // Adds the probability of 1 stage one prized, etc.
                // Same as basics algorithm
                
                probStageTwoPrized = $scope.noncummhyp(i, 54, 4, 60);
                // Adds the probability of 1 stage two prized, etc.
                // Same as basics algorithm
                
                probStageTwoPrized = $scope.noncummhyp(i, 54, 4, 60);
                // Adds the probability of candy prized
                // Same as basics algorithm
                
                //var prob = 1 - (probBasicPrized + probStageOnePrized - probBasicPrized * probStageOnePrized);
                // The total probability is the addition of the two minus the product
                // flipped at the very end
                
                // further implementation on the way...
                prob = prob.toFixed(4);
                
                str += prob * 100 + "% chance of getting " + i + " out." +  "\t";
            }
        }
        
        return str;
    }
    
    $scope.noncummhyp = function (x, n, m, nn) {
        return $scope.hyp(x, n, m, nn) - $scope.hyp(x - 1, n, m, nn);
    }
    
    // (0, prize/deck size, sample size, population size (60 in deck))
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
