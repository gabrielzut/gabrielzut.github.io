<style type="text/scss">
.header {
    width: 100vw;
    height: 100vh;
    background-image: url("../../public/assets/checkered-bg.svg");
    background-repeat: repeat;
    background-size: 10rem 10rem ;
    z-index: -40;

    &__foreground {
        width: 100%;
        height: 100vh;
        background-image: url("../../public/assets/90s-abstract-bg.gif");
        background-size: auto 100vh;

        @media only screen and (max-width: 56.25em) {
            .header__foreground {
                background-size: auto 80vh; 
            } 
        }

        background-repeat: no-repeat;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: -20;
    }

    &__title {
        text-align: center;
        font-size: 10rem;

        @media only screen and (max-width: 56.25em) {
            .header__title {
                font-size: 6rem; 
            }
        }

        background: linear-gradient(orange, orangered);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 200;
        position: relative;
        filter: drop-shadow(0.20rem 0.20rem black);
        transform: skewX(-15deg);

        span {
            font-weight: 700;
        }
    }
}
</style>

<div class="header section">
    <div class="header__foreground">
        <h1 class="header__title">
            Welcome to<br> the <span>Zutiweb</span>
        </h1>
    </div>
</div>