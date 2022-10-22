import "./css/index.css"
import IMask from "imask"

let options = ['color: white', 'background: red', 'font-size:16px'].join(';') // personalizar o console :D
var inputNumberCard = document.querySelector("#card-number")
var inputNameCard = document.querySelector("#card-holder")
var inputExpirationDate = document.querySelector("#expiration-date")
var inputSecurityCode = document.querySelector("#security-code")
var buttonReset = document.querySelector("#button-reset-primary")

let cc_number = document.querySelector(".cc-number")
let cc_security_value = document.querySelector(".cc-security .value")
let cc_holder_value = document.querySelector(".cc-holder .value")
let cc_expiration_value = document.querySelector(".cc-expiration .value")


// MASCARAS

const securityCodePattern = {
  mask: '0000'
}

const securityCodeMasked = IMask(inputSecurityCode, securityCodePattern)

const expirationDatePattern = {
  mask: 'MM{/}YY', // mascara geral
  blocks: {
    YY: {
      mask: IMask.MaskedRange, // mascara específica para cada campo
      from: String(new Date().getFullYear()).slice(2),
      to: String(new Date().getFullYear() + 10).slice(2)
    },
    MM: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 12
    }

  }
}

const expirationDateMasked = IMask(inputExpirationDate, expirationDatePattern)

const cardNumberPattern = {

  mask: [
    {
      mask: "0000 0000 0000 0000",
      regex: /^4\d{0,15}/, // A função do regex é observar o padrão que está sendo escrito no input e validar se encaixa com o declarado na mascara. Se sim, é só implementar a lógica do negócio no campo "dispatch", que recebe uma arrow function com o retorno
      cardtype: "visa"
    },
    {
      mask: "0000 0000 0000 0000",
      regex: /(^5[1-5]\d{0,2}|^22\d{2,9}\d|^2[3,7]\d{0,2})\d{0,12}/,
      cardtype: "mastercard"
    },
    {
      mask: "0000 0000 0000 0000",
      cardtype: "default"
    }
  ], dispatch: function (appended, dynamicMasked) {
    // dynamicMasked é a abstração do input que recebeu essa mascara (provavelmente o plugin se encarrega de encontrar os inputs que estão implementando-a). Ela possui seus atributos assim como qualquer elemento do DOM. Alguns deles: value (semelhante ao input), compiledMasks que são todas as máscaras dessa mascara dinâmica etc.



    const number = (dynamicMasked.value + appended).replace(/\D/g, "")
    // Variável utilizada para retirar os caracteres que não são dígitos (regra de negócio)


    console.log("%c ----- Máscara do input - Dinamicmasked -----", options)
    console.log(dynamicMasked)

    const foundMask = dynamicMasked.compiledMasks.find(function (item) {
      // .find -> Percorre as mascaras compiladas do objeto dynamicMasked para validar se em alguma delas dá "match" com a variável number (semelhante ao foreach)

      return number.match(item.regex)
      // match aqui se comporta como uma expressão booleana (atendeu ou não à expressão regular do item (mascara) ? ). Se retornar diferente de null, então o find finaliza e retorna o item (a mascara) validada naquela iteração. Se retornar null, então o .find() passa para o próximo item.

    })

    console.log("%c ----- Máscara identificada após passar pelo match -----", options + ";background: green")
    console.log(foundMask)

    return foundMask
  }
}

const cardNumberMasked = IMask(inputNumberCard, cardNumberPattern)


// FUNÇÕES UTILITÁRIAS PARA MANIPULAR O CARTÃO
function setCardType(type) {
  const bgColor01 = document.querySelector(".cc-bg svg > g g:nth-child(1) path")
  const bgColor02 = document.querySelector(".cc-bg svg > g g:nth-child(2) path")
  const ccLogo = document.querySelector(".cc-logo span:nth-child(1) img")

  const colors = {
    visa: ["#436D99", "#2D57F2"],
    mastercard: ["#DF6F29", "#C69347"],
    default: ["black", "gray"],
  }

  if (type == null) {
    bgColor01.setAttribute("fill", colors["default"][0])
    bgColor02.setAttribute("fill", colors["default"][1])
  } else {
    if (type != "default") {
      ccLogo.setAttribute("src", `/cc-${type}.svg`)
    }

    bgColor01.setAttribute("fill", colors[type][0])
    bgColor02.setAttribute("fill", colors[type][1])
  }
}




cardNumberMasked.on("accept", () => {
  const cardType = cardNumberMasked.masked.currentMask.cardtype
  updateCardNumber(cardNumberMasked.value)

  setCardType(cardType)

})

function updateCardNumber(number) {

  cc_number.innerHTML = number.length === 0 ? "1234 5678 9012 3456" : number

}

securityCodeMasked.on("accept", () => {

  updateSecurityCode(securityCodeMasked.value)

})

function updateSecurityCode(code) {

  cc_security_value.innerHTML = code.length === 0 ? "123" : code

}

expirationDateMasked.on("accept", () => {

  updateExpirationDate(expirationDateMasked.value)

})

function updateExpirationDate(date) {

  cc_expiration_value.innerHTML = date.length === 0 ? "MM/AA" : date

}

inputNameCard.addEventListener("input", () => {

  updateHolderName(inputNameCard.value)

})

function updateHolderName(name) {

  cc_holder_value.innerHTML = name.length === 0 ? "FULANO DA SILVA" : name

}

function upadeteCardDefault() {

  updateCardNumber("")
  updateExpirationDate("")
  updateHolderName("")
  updateSecurityCode("")

  cardNumberMasked.updateValue()
  securityCodeMasked.updateValue()
  expirationDateMasked.updateValue()

}

buttonReset.addEventListener("click", () => {


  let form = document.querySelector("form")
  form.reset()
  setCardType("default")
  form.reset()
  upadeteCardDefault()

})



globalThis.setCardType = setCardType
