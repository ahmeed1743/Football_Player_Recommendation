let toggleMenu = document.querySelector('.toggleMenu');
let navigation = document.querySelector('.navigation');


toggleMenu.addEventListener("click", () => {
    navigation.classList.toggle("active");
})


const navlinks = document.querySelectorAll(".navlink");

function checkScrollPosition() {
    if (window.scrollY === 0) {
        navlinks.forEach(item => item.classList.remove("active"));
        navlinks[0].classList.add("active");
    }
}

window.addEventListener("scroll", checkScrollPosition);

navlinks.forEach(navlink => {
    navlink.addEventListener("click", function () {
        navlinks.forEach(item => item.classList.remove("active"));
        navlink.classList.add("active");
    });
});

checkScrollPosition();


/** TimeLine */

/** TimeLine */
