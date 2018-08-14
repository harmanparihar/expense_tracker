<add-transaction>
  <div id="new_tr">
    <form class="add">
        <label for="amount">Enter the amount spend (CAD) </label>
        <input type="number" class="amt" id="amount" min=0 step=".01" required>
        <label for="date">Date of Transaction</label>
        <input type="date" id="date">
        <label for="description">Transaction Description</label>
        <textarea name="desc" placeholder="" id="description" rows="8" cols="80" required>
        </textarea>
        <input class="submit" type="submit">
    </form>
  </div>
</add-transaction>
