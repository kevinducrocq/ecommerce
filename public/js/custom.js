$(function () {
  Stripe.setPublishableKey(
    "pk_test_51Jk8oDCetpwHurzPcGiUml8baZCtsvdo9F3VKLE2qDmWb43dbbk2se5PoP0Eeg7nWjSRcSp5pZ7Q84cn60awmlRG00GrCCOC3F"
  );

  $("#payment-form").submit(function (e) {
    e.preventDefault();

    $("#submit-button").attr("disabled", "disabled");

    Stripe.createToken(
      {
        number: $("#card-number").val(),
        cvc: $("#card-cvc").val(),
        exp_month: $("#exp_month").val(),
        exp_year: $("#exp_year").val(),
      },
      stripeResponseHandler
    );
  });

  function stripeResponseHandler(status, response) {
    if (response.error) {
      $("#payment-error").html(
        '<div class="alert alert-warning">' + response.error.message + "</div>"
      );
      $("#submit-button").removeAttr("disabled");
    } else {
      var token = response["id"];
      var form = $("#payment-form");
      form.append(
        '<input type="hidden" name="stripeToken" value="' + token + '">'
      );

      form.get(0).submit();
    }
  }

  $(document).on("click", "#plus", function (e) {
    e.preventDefault();

    // On récupère les valeurs des champs price/value/quantity
    var priceValue = parseFloat($("#priceValue").val());
    var quantity = parseInt($("#quantity").val());

    priceValue += parseFloat($("#priceHidden").val());

    // Quand on clique sur + , on ajoute 1
    quantity += 1;

    // On attribue les nouvelles valeurs(quantity,prix,total)
    $("#quantity").val(quantity);
    $("#priceValue").val(priceValue.toFixed(2));
    $("#total").html(quantity);
  });

  $(document).on("click", "#minus", function (e) {
    e.preventDefault();

    // On récupère les valeurs des champs price/value/quantity
    var priceValue = parseFloat($("#priceValue").val());
    var quantity = parseInt($("#quantity").val());

    if (quantity === 1) {
      priceValue = $("#priceHidden");
      quantity = 1;
    } else {
      priceValue -= parseFloat($("#priceHidden").val());

      // Quand on clique sur + , on ajoute 1
      quantity -= 1;
    }

    // On attribue les nouvelles valeurs(quantity,prix,total)
    $("#quantity").val(quantity);
    $("#total").html(quantity);
    $("#priceValue").val(priceValue.toFixed(2));
  });
});
