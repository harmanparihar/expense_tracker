$(function(){

  //initial classes assigned to the tabs for required layout
  $("#prev_transaction").addClass("nonexpanded");
  $("#new_tr").addClass("expanded");
  $("#search").addClass("nonexpanded");
  $("#weekly").addClass("nonexpanded");


// initializing the input fields
  $("#amount").val("");
  $("#description").val("");
  $("#amount").focus();


  let total = 0; //Gloabal variable for storing total amount of expenses
  const ref = firebase.database().ref('/transaction');// Creating a firebase reference object


// Event handling for the first tab (Adding new transaction)
// Displaying just the components required for adding new transacting and hiding others
  $(".tabs ul li:nth-of-type(1)").unbind().click(function(){
    $("#prev_transaction").addClass("nonexpanded");
    $("#prev_transaction").removeClass("expanded");
    $("#new_tr").addClass("expanded");
    $("#search").addClass("nonexpanded");
    $("#weekly").addClass("nonexpanded");
    $("#new_tr").removeClass("nonexpanded");
    $("#search").removeClass("expanded");
    $("#weekly").removeClass("expanded");
  });


// On new transaction addition through form submission event
  $(".add").submit(function(event){
    event.preventDefault();
    let amt=$("#amount").val();
    let desc=$("#description").val();
    let time=$("#date").val();
    $("#amount").val("");
    $("#description").val("");
    $("#date").val("");
    $("#amount").focus();
    ref.push({ amount: amt, description: desc, date: time });
  });


  // Event handling for the second tab (Viewing Previous transactions)
  $(".tabs ul li:nth-of-type(2)").unbind().click(function(){
  $("#prev_transaction").addClass("expanded");
  $("#new_tr").addClass("nonexpanded");
  $("#search").addClass("nonexpanded");
  $("#weekly").addClass("nonexpanded");
  $("#new_tr").removeClass("expanded");
  $("#prev_transaction").removeClass("nonexpanded");
  $("#search").removeClass("expanded");
  $("#weekly").removeClass("expanded");
  });

  // Fetching previous transactions from firebase
  ref.on('child_added', function(data) {
    const Id = data.key;
    const Obj = data.val();
    let amt = Obj.amount;
    let desc = Obj.description;
    let date= Obj.date;
    total=total + parseFloat(amt);
    $(".total").html(total);
    $("#prev_transaction").prepend(`<div id=${Id}>
      <div>${desc}</div>
      <div>${date}</div>
      <div>$<span>${amt}</span>(CAD) </div>
      <button>Delete Transaction</button>
      </div>`);
      $('button').unbind().click(function() {     // Deleting a transaction
        $(this).parent().fadeOut(function(){
          let id = $(this).attr('id');
          total=total-$(this).children().eq(2).children().html();
          $(".total").html(total);
          firebase.database().ref(`transaction/${id}`).remove();
        });
      });
  });


  // Event handling for the third tab (Searching for transactions)
$(".tabs ul li:nth-of-type(3)").unbind().click(function(){
  $("#prev_transaction").addClass("nonexpanded");
  $("#new_tr").addClass("nonexpanded");
  $("#search").addClass("expanded");
  $("#weekly").addClass("nonexpanded");
  $("#new_tr").removeClass("expanded");
  $("#search").removeClass("nonexpanded");
  $("#prev_transaction").removeClass("expanded");
  $("#weekly").removeClass("expanded");
  });

  // Search bar | Form Submission handling
  $(".searchbar").submit(function(event){
    event.preventDefault();
    let sum = 0;
    $(".searchlist").html("");
    $(".searchtotal").html("");
    $(".searchtotal").append('<div class="st">Total: <span class="sum"></span>(CAD)</div>');
    let str=$("#s").val();
    $("#s").val("");
    $("#s").focus();
    ref.on('child_added', function(data) {
      const Id = data.key;
      const Obj = data.val();
      let amt = Obj.amount;
      let desc = Obj.description;
      let date= Obj.date;
      if(desc.toLowerCase().indexOf(str.toLowerCase())>=0){
      sum= sum + parseFloat(amt);
      $(".sum").html(sum);
      $(".searchlist").prepend(`<div id=${Id}>
      <div> ${desc}</div>
        <div>${date}</div>
        <div> $${amt}(CAD)</div>
        <button>Delete Transaction</button>
        </div>`);
        $('button').unbind().click(function() { // Delete a transaction
          $(this).parent().fadeOut(function(){
            let id = $(this).attr('id');
            sum=sum-$(this).children().eq(2).children().html();
            $(".sum").html(sum);
            firebase.database().ref(`transaction/${id}`).remove();
          });
        });
      }
    });
  });

  // Event handling for the fourth tab (Weekly total for transactions made in an year)
  $(".tabs ul li:nth-of-type(4)").unbind().click(function(){
    $("#weekly").html("");
    $("#prev_transaction").addClass("nonexpanded");
    $("#new_tr").addClass("nonexpanded");
    $("#search").addClass("nonexpanded");
    $("#prev_transaction").removeClass("expanded");
    $("#weekly").addClass("expanded");
    $("#new_tr").removeClass("expanded");
    $("#search").removeClass("expanded");
    $("#weekly").removeClass("nonexpanded");
    let years=new Array(); //Creating an array to store a list of distinct years for all the transaction
    ref.on('child_added', function(data) {
      const Id = data.key;
      const Obj = data.val();
      let amt = Obj.amount;
      let desc = Obj.description;
      let time=new Date(Obj.date) ;
      if (!years.includes(time.getFullYear())){
           years.push(time.getFullYear()); //pushing the distinct values of years into the new array "years"
        }
    });
    for(let y of years){ //for each value of year creating a list of all the weeks that are part of the transactions
    let weeks= new Array();
    ref.on('child_added', function(data) {
      const Id = data.key;
      const Obj = data.val();
      let amt = Obj.amount;
      let desc = Obj.description;
      let time=new Date(Obj.date) ;
      if (!weeks.includes(time.getWeek()) && time.getFullYear()==y){
           weeks.push(time.getWeek()); //pushing unique values of week number into the new array called "weeks"
        }
    });
    weeks.sort(); //Sorting "weeks" array in ascending order for a particular year
    let weekarr = new Array();
    ref.on('child_added', function(data) {
      const Id = data.key;
      const Obj = data.val();
      let amt = Obj.amount;
      let desc = Obj.description;
      let time=new Date(Obj.date) ;
      for(let i of weeks){
        if(i == time.getWeek()){
          weekarr[i]=weekarr[i] ||0;
          weekarr[i]=parseFloat(weekarr[i])+parseFloat(amt); //Calculating the total ammount spend during a particular week
          console.log(weekarr[i]);
        }
      }
    });

    // Displaying the list of years and weeks of that year
    ref.on('value', function(data) {
      $("#weekly").append(`<h2>${y}</h2>`)
      for(let i in weekarr){
        $("#weekly").append(`<div>Week ${i} : $${weekarr[i]}(CAD)</div>`);
      }
    });
  }
});


//Function to calculate the week number using the given date
  Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
  }
});
