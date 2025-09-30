document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.faqs__accordion-button')
  console.log('Aantal knoppen gevonden:', items.length) // Controleer of de knoppen worden gevonden

  function toggleAccordion() {
    const itemToggle = this.getAttribute('aria-expanded')
    console.log('Toggle status voor knop:', itemToggle) // Controleer de huidige status

    for (let i = 0; i < items.length; i++) {
      items[i].setAttribute('aria-expanded', 'false')
    }

    if (itemToggle === 'false') {
      this.setAttribute('aria-expanded', 'true')
    }
  }

  items.forEach((item) => item.addEventListener('click', toggleAccordion))
})
