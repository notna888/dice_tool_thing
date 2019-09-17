

function roll_dice(number_of_dice, sides_on_each_die){

  this_dice_roll = []

  for (var i = 0; i < number_of_dice; i++) {
    this_number = Math.floor(Math.random() * sides_on_each_die) + 1;
    this_dice_roll.push(this_number);
  }

  return this_dice_roll

}

function multiple_dice_rolls(num_dice, sides, trials) {
  results_of_trials = []
  for (var i = 0; i < trials; i++) {
    all_dice_rolled = roll_dice(num_dice, sides);
    total_val = all_dice_rolled.reduce(add_up_array);
    results_of_trials.push(total_val)
  }
  return results_of_trials
}

function dice_rolls_to_dictionary(roll_numbers){
  dist_dict = new Map()
  for (var i = 0; i < roll_numbers.length; i++) {
    roll_val_str = roll_numbers[i]
    current_val = dist_dict.get(roll_val_str);
    if(current_val == undefined){
      current_val = 0
    }
    current_val += 1
    dist_dict.set(roll_val_str, current_val)
  }

  return dist_dict
}


function generate_dict_for_chart(die_rolling_string, number_trials) {
  list_of_dice_rolls = die_rolling_string.split('+')
  results_of_rolls = new Array(number_trials).fill(0);
  for (var i = 0; i < list_of_dice_rolls.length; i++) {
    this_section = list_of_dice_rolls[i]
    dice_to_roll = die_string_to_numbers(this_section)
    die_rolls = multiple_dice_rolls(dice_to_roll['numDie'], dice_to_roll['sidesDie'], number_trials)
    results_of_rolls = add_arrays_together(die_rolls, results_of_rolls)
  }
  unsorted_map = dice_rolls_to_dictionary(results_of_rolls)
  sorted_map = sorted_map_object(unsorted_map)

  return map_to_d3_obj(sorted_map, '#3c763d')
}



// Helpers

function add_arrays_together(arr1, arr2){
  new_arr = []
  for (var i = 0; i < arr1.length; i++) {
    this_val = arr1[i] + arr2[i]
    new_arr.push(this_val)
  }
  return new_arr
}

function sorted_map_object(unsorted_map){
  var mapAsc = new Map(Array
      .from(unsorted_map)
      .sort((a, b) => {
        /** a[0], b[0] is the key of the map */
        return a[0] - b[0];
      })
    )
  return mapAsc
}

function sort_numbers(a, b) {
    return a - b;
}

function map_to_d3_obj(mapObj, fill_colour) {
  dict_of_rolls = map_to_obj(mapObj)
  new_dict = {}

  console.log(dict_of_rolls)

  forEach(dict_of_rolls, function(value, key){
    console.log(value)
    new_dict[key] = {'val':value, 'fill_colour': fill_colour}
  })

  return new_dict
}

function map_to_obj(mapObj){
  let obj = {};

  mapObj.forEach(function(value, key){
    obj[key] = value
  });

  return obj;
}

function die_string_to_numbers(die_string){
/**
 * Turns a die string into an array needed for the dice rolling script
 *
 * @param {string} die_string The string representing what dice to roll i.e. 5d10
 * @returns {array} The array will have the number of dice needed to be rolled in index 0, the sides of dice in index 1.
 * Something to note is if just a number is passed in, that's the same as (n)d1.
 */

 handling = die_string.split('d')

 numberOfDice = 0
 sidesOnDie = 1

 if(handling.length == 1){
   numberOfDice = parseInt(handling[0])
 }
 else if(handling.length > 2){
   alert('Problem with die input')
 }
 else{
   numberOfDice = parseInt(handling[0])
   sidesOnDie = parseInt(handling[1])
 }

 return {
   'numDie' : numberOfDice,
   'sidesDie' : sidesOnDie,
 }

}

function add_up_array(total, current_val){
  return total + current_val
}




/**
 * A simple forEach() implementation for Arrays, Objects and NodeLists
 * pinched from: https://gist.github.com/cferdinandi/42f985de9af4389e7ab3
 * @private
 * @param {Array|Object|NodeList} collection Collection of items to iterate
 * @param {Function} callback Callback function for each iteration
 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
 */
var forEach = function (collection, callback, scope) {
	if (Object.prototype.toString.call(collection) === '[object Object]') {
		for (var prop in collection) {
			if (Object.prototype.hasOwnProperty.call(collection, prop)) {
				callback.call(scope, collection[prop], prop, collection);
			}
		}
	} else {
		for (var i = 0, len = collection.length; i < len; i++) {
			callback.call(scope, collection[i], i, collection);
		}
	}
};
