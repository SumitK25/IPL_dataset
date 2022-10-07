const csvFilePath1 = ('/home/sumit/Desktop/mountblue/IPL/src/data/matches.csv')
const csvFilePath2 = ('/home/sumit/Desktop/mountblue/IPL/src/data/deliveries.csv')
const csv = require('csvtojson')
const fs = require('fs')

csv()
    .fromFile(csvFilePath1)
    .then((jsonObj1) => {
        MatchesPerYear(jsonObj1)
        WinsPerTeam(jsonObj1)
        wonTossAndMatch(jsonObj1)
        mostPlayerOfTheMatch(jsonObj1)
        csv()
    .fromFile(csvFilePath2)
    .then((jsonObj2) => {
                ExtraRunsByTeam(jsonObj1, jsonObj2)
                FindEconomicalBowler(jsonObj1, jsonObj2)
                strikeRateOfBatsman(jsonObj1, jsonObj2)
                dismissalByAnotherPlayer(jsonObj1, jsonObj2)
                superOverEconomy(jsonObj1, jsonObj2)
        })
    })



// Number of matches played per year for all the years in IPL.

function MatchesPerYear(matches) {
    let result = matches.reduce((accumelator, current) => {

        if (accumelator.hasOwnProperty(current.season)) {
            accumelator[current.season] += 1
        } else {
            accumelator[current.season] = 1
        }
        return accumelator
    }, {});
    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/matchesPerYear.json', JSON.stringify(result), function (err) {
        if (err) { console.log(err) }
    })
}

// Number of matches won per team per year in IPL

function WinsPerTeam(matches) {
    let result = matches.reduce((accumelator, current) => {
        if (accumelator.hasOwnProperty(current.winner)) {
            if (accumelator[current.winner].hasOwnProperty([current.season])) {
                accumelator[current.winner][current.season] += 1
            }
            else {
                accumelator[current.winner][current.season] = 1
            }
        } else {
            accumelator[current.winner] = {}
            accumelator[current.winner][current.season] = 1
        }
        return accumelator
    }, {});
    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/matchesWonPerTeam.json', JSON.stringify(result), function (err) {
        if (err) { console.log(err) }
    })
}

// Extra runs conceded per team in the year 2016

function ExtraRunsByTeam(matches, deliveries) {
    let requiredIds = [];
    let requiredYearArray = matches.filter((object) => {
        if (object['season'] === '2016') {
            requiredIds.push(object.id);
            return true
        }
    });
    let requiredDeliveryIdArray = deliveries.filter((object) => {
        return requiredIds.includes(object.match_id)
    })

    let result = requiredDeliveryIdArray.reduce((accumelator, current) => {
        if (accumelator.hasOwnProperty(current.batting_team)) {
            accumelator[current.batting_team] += parseInt(current.extra_runs)
        } else {
            accumelator[current.batting_team] = parseInt(current.extra_runs)
        }
        return accumelator
    }, {});
    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/extraRunsPerTeam.json', JSON.stringify(result), function (err) {
        if (err) { console.log(err) }
    })
}


// Top 10 economical bowlers in the year 2015

function FindEconomicalBowler(matches, deliveries) {
    let requiredIds = [];
    let requiredYearArray = matches.filter((object) => {
        if (object['season'] === '2015') {
            requiredIds.push(object.id);
            return true
        }
    });
    let requiredDeliveryIdArray = deliveries.filter((object) => {
        return requiredIds.includes(object.match_id)
    })

    let bowlerRunsDetails = requiredDeliveryIdArray.reduce((accumelator, current) => {
        if (current.bowler in accumelator) {
            accumelator[current.bowler]["runs"] += parseInt(current.total_runs)
            accumelator[current.bowler]["balls"] += 1
            accumelator[current.bowler]['economy'] = parseFloat((accumelator[current.bowler]["runs"] / ((accumelator[current.bowler]['balls']) / 6)).toFixed(2))
        } else {
            accumelator[current.bowler] = {}
            accumelator[current.bowler]["runs"] = parseInt(current.total_runs)
            accumelator[current.bowler]["balls"] = 1
        }
        return accumelator
    }, []);
    let result = Object.fromEntries(Object.entries(bowlerRunsDetails).sort((a, b) => a[1].economy - b[1].economy)
        .slice(0, 10))

    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/topEconomicalBowlers.json', JSON.stringify(result), function (err) {
        if (err) { console.log(err) }
    })

}

// Find the number of times each team won the toss and also won the match

function wonTossAndMatch(matches) {
    let result = matches.filter((object) => {
        return object.toss_winner === object.winner
    })
    let output = result.reduce((accumelator, current) => {
        if (accumelator.hasOwnProperty(current.winner)) {
            accumelator[current.winner] += 1
        } else {
            accumelator[current.winner] = 1
        }
        return accumelator
    }, {})

    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/matchWonTossWon.json', JSON.stringify(output), function (err) {
        if (err) { console.log(err) }
    })

}

// Find a player who has won the highest number of Player of the Match awards for each season

function mostPlayerOfTheMatch(matches) {
    let result = matches.reduce((accumelator, current) => {
        if (accumelator.hasOwnProperty(current.season)) {
            if (accumelator[current.season].hasOwnProperty(current.player_of_match)) {
                accumelator[current.season][current.player_of_match] += 1
            } else {
                accumelator[current.season][current.player_of_match] = 1
            }

        } else {
            accumelator[current.season] = {}
            accumelator[current.season][current.player_of_match] = 1
        }

        return accumelator
    }, {})

    let resultArray = Object.entries(result)
    let output = resultArray.map((array) => {
        let season = array[0]
        let players = array[1]
        let topPlayer = Object.fromEntries(Object.entries(players).sort((a, b) => b[1] - a[1]).slice(0, 1))
        let key = {}
        key[season] = topPlayer
        return key
    })
    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/mostPlayerOfTheMatch.json', JSON.stringify(output), function (err) {
        if (err) { console.log(err) }
    })
}

// Find the strike rate of a batsman for each season

function strikeRateOfBatsman(matches, deliveries) {
    let playerGames = deliveries.filter((object) => {
        return object.batsman === "Yuvraj Singh"
    })
    //console.log(playerGames)
    let playerGamesSeasons = playerGames.map((object) => {
        let extractedYear = matches.filter((obj) => {
            return obj.id === object.match_id
        })
            .map((obj) => {
                return obj.season
            })
        object.season = extractedYear[0]
        return object
    })
    //console.log(playerGamesSeasons)

    let result = playerGamesSeasons.reduce((accumelator, current) => {
        if (accumelator.hasOwnProperty(current.season)) {
            accumelator[current.season]["runs"] += parseInt(current.batsman_runs)
            accumelator[current.season]["balls"] += 1
            accumelator[current.season]["strikeRate"] = ((accumelator[current.season]["runs"] / accumelator[current.season]["balls"]) * 100).toFixed(2)
        } else {
            accumelator[current.season] = {}
            accumelator[current.season]["runs"] = parseInt(current.batsman_runs)
            accumelator[current.season]["balls"] = 1
            accumelator[current.season]["strikeRate"] = ((accumelator[current.season]["runs"] / accumelator[current.season]["balls"]) * 100).toFixed(2)
        }
        return accumelator
    }, {})
    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/strikeRateOfPlayer.json', JSON.stringify(result), function (err) {
        if (err) { console.log(err) }
    })

}

// Find the highest number of times one player has been dismissed by another player

function dismissalByAnotherPlayer(matches, deliveries) {
    let dismissedObjects = deliveries.filter((object) => {
        if (!(object.dismissal_kind === "" || object.dismissal_kind == "run out")) {
            return true
        }
    })

    let reducedOuts = dismissedObjects.reduce((accumelator, current) => {
        if (accumelator.hasOwnProperty(current.bowler)) {
            if (accumelator[current.bowler].hasOwnProperty(current.player_dismissed)) {
                accumelator[current.bowler][current.player_dismissed] += 1
            } else {
                accumelator[current.bowler][current.player_dismissed] = 1
            }

        } else {
            accumelator[current.bowler] = {}
            accumelator[current.bowler][current.player_dismissed] = 1
        }
        return accumelator
    }, {})

    let topOfDismissals = Object.fromEntries(Object.entries(reducedOuts).map((array) => {
        let batsmans = Object.fromEntries(Object.entries(array[1]).sort((a, b) => { return b[1] - a[1] }).slice(0, 1))
        return [array[0], batsmans]
    }))

    let result = Object.entries(topOfDismissals).slice(1, -1)
        .reduce((accumelator, current) => {
            if (Object.values(current[1]) > Object.values(accumelator[1])) {
                accumelator = current
            }
            return accumelator

        }, Object.entries(topOfDismissals)[0])
    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/dismissalByPlayer.json', JSON.stringify(result), function (err) {
        if (err) { console.log(err) }
    })
}

// Find the bowler with the best economy in super overs

function superOverEconomy(matches, deliveries) {
    let requiredIds = [];
    let requiredYearArray = matches.map((object) => {
        return object.season
    })
        .filter((year, index, array) => {
            return array.indexOf(year) === index
        })
    //console.log(requiredYearArray)

    let requiredDeliveryIdArray = deliveries.filter((object) => {
        if (!(object.is_super_over === "0")) {
            return true;
        }
    })
    //console.log(requiredDeliveryIdArray)
    let bowlerEconomyDetails = requiredDeliveryIdArray.reduce((accumelator, current) => {
        if (current.bowler in accumelator) {
            accumelator[current.bowler]["runs"] += parseInt(current.total_runs)
            accumelator[current.bowler]["balls"] += 1
            accumelator[current.bowler]['economy'] = parseFloat((accumelator[current.bowler]["runs"] / ((accumelator[current.bowler]['balls']) / 6)).toFixed(2))
        }
        else {
            accumelator[current.bowler] = {}
            accumelator[current.bowler]["runs"] = parseInt(current.total_runs)
            accumelator[current.bowler]["balls"] = 1
        }
        return accumelator
    }, []);
    //console.log(bowlerEconomyDetails)
    let result = Object.fromEntries(Object.entries(bowlerEconomyDetails)
        .sort((a, b) => a[1].economy - b[1].economy)
        .slice(0, 1))
    fs.writeFile('/home/sumit/Desktop/mountblue/IPL/src/public/output/superOverBestEconomy.json', JSON.stringify(result), function (err) {
        if (err) { console.log(err) }
    })
}