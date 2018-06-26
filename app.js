
// --------------------------------budget controller-------------------------------
var budgetController = (function() {

	var Expence = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}	

	Expence.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1
		}
	}

	Expence.prototype.getPercentage = function() {
		return this.percentage
	}

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});
		data.totals[type] = sum
	}

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1,
	}

	return {
		addItem(type, des, val) {

			var newConstructorItem, ID;

			// create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			// create new item using constructor. Check argument "type" to use correct Constructor
			if (type === "exp") {
				newConstructorItem = new Expence(ID, des, val);
			} else if (type === "inc") {	
				newConstructorItem = new Income(ID, des, val)
			}
			// add created Item to data object
			data.allItems[type].push(newConstructorItem);
			//return created Item
			return newConstructorItem;
		},
		deleteItem(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
				console.log('item ' + type + '-' + id + ' deleted');

			};

		},
		calculateBudget() {
			// посчитать все доходы и затраты и добавить в DATA
			calculateTotal('exp');
			calculateTotal('inc');
			// посчитать текущий баланс и добавить в DATA
			data.budget = data.totals.inc - data.totals.exp;
			// посчитать процент потраченых денег и добавить в DATA
			if(data.budget > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		calculatePercentages() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			})
		},
		getPercentages() {
			var allPercentages = data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPercentages;
		},
		returnBudget() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		testing() {
			return data
		}
	};

})();


// -------------------------UI Controller------------------------

var uiController = (function(argument) {
	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		addButton: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		totalBudget: '.budget__value',
		incomeBudget: '.budget__income--value',
		expensesBudget: '.budget__expenses--value',
		expensesPercentage: '.budget__expenses--percentage',
		deleteButton: '.container',
		itemPercentage: '.item__percentage',
		dateLabel: '.budget__title--month',

	};
	var formatNumber = function(number, type) {
		var splitNumber, int, dec, type;

		number = Math.abs(number);
		number = number.toFixed(2);
		splitNumber = number.split('.');
		int = splitNumber[0];
		dec = splitNumber[1];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
		} 

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	};
	return {
		getIntput() {
			return {
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			}
		},
		addItemToList(obj, type) {
			var itemHtml, newItemHtml, element;
			if (type === "inc") {
				element = DOMStrings.incomeContainer;
				itemHtml = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else if (type === "exp") {
				element = DOMStrings.expensesContainer;
				itemHtml = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			newItemHtml = itemHtml.replace("%id%", obj.id);
			newItemHtml = newItemHtml.replace("%description%", obj.description);
			newItemHtml = newItemHtml.replace("%value%", formatNumber(obj.value, type));
			newItemHtml = newItemHtml.replace("%value%", formatNumber(obj.value, type));
			

			document.querySelector(element).insertAdjacentHTML('beforeend', newItemHtml);	
		},
		removeItemFromList(id) {
			var el = document.getElementById(id).remove();
		},
		clearFields() {
			var fieldsValue;
			fieldsValue = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
			fieldsValue.forEach(function(current) { // nodeList
				current.value = "";
			});
			fieldsValue[0].focus();
		},
		displayBudget(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMStrings.totalBudget).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeBudget).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expensesBudget).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.expensesPercentage).textContent = obj.percentage + '%';
			} else document.querySelector(DOMStrings.expensesPercentage).textContent = '--';
			

			// цыкл
			/*props = Object.values(obj);

			for (let i = 0; i < uiItems.length; i++) {
				uiItems[i].innerHTML = props[i]
			};
			*/

		},
		displayPercentages(percentages) {
			var items = document.querySelectorAll(DOMStrings.itemPercentage)
			items.forEach(function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '--';
				}
				
			});
		},
		displayMonth() {
			var now, year, month, months;
			now = new Date();
			month = now.getMonth();
			year = now.getFullYear();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];
			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		changeType() {
			var inputs = document.querySelectorAll(DOMStrings.inputType + ', ' + DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

			inputs.forEach(function(current) {
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.addButton).classList.toggle('red');

		},
		getDomStrings() {
			return DOMStrings;
		},
	}
})();



// ----------------------- global app controller -----------------------------------

var controller = (function(budget, ui) {

	var setupEventListeners = function() {

		var DOM = ui.getDomStrings();
		document.querySelector(DOM.addButton).addEventListener('click', addItem);

		document.addEventListener('keypress', function(e) {
			if (e.keycode === 13 || e.which === 13) {
				addItem();
			}
		});
		document.querySelector(DOM.deleteButton).addEventListener('click', deleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', ui.changeType);
	};


	// -------------------CORE-------------------
	var updateBudget = function() {
		console.log('update budger');
  	// посчитать кошелек
  	budget.calculateBudget();
  	// return budget
  	var budgetValue = budget.returnBudget();
  	console.log(budgetValue);
  	// отобразить кошелек в UI
  	ui.displayBudget(budgetValue);
  };
  var updatePercentages = function() {
  	budget.calculatePercentages();
  	var percentages = budget.getPercentages();
  	console.log(percentages);
  	ui.displayPercentages(percentages);
  };
  var addItem = function() {
		// взять инфу из инпута
		var input = ui.getIntput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
  		// добавить инфу в budget cntrl
  		var newItem = budget.addItem(input.type, input.description, input.value);

  		ui.addItemToList(newItem, input.type);

  		// отчистить поля
  		ui.clearFields();
  		// calculate and update budget
  		updateBudget();
  		updatePercentages();
  	};
  };
  var deleteItem = function(event) {
  	let itemID, splitID, type, ID;
  	itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
  	if (itemID) {
  		splitID = itemID.split('-');
  		type = splitID[0];
  		ID = parseInt(splitID[1]);

  		// удалить ITEM из DATA
  		budget.deleteItem(type, ID);

  		// удалить ITEM из UI
  		ui.removeItemFromList(itemID);
  		// Обновить BUDGET
  		updateBudget();
  		updatePercentages();
  	}

  };


	// --------------------INIT------------------
	return {
		init() {
			console.log('init....')
			ui.displayMonth();
			ui.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			console.log('reset lables')
			setupEventListeners();
			console.log('done')
		}
	};

})(budgetController, uiController);

controller.init();