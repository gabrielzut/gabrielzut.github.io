<style type="text/scss">
.desktop__icon-grid {
    padding-left: 1rem;
    display: grid;
    grid-template-columns: 6rem;
    grid-template-rows: repeat(3, 6rem);
    grid-row-gap: 0.5rem;

    @media only screen and (max-width: 75em) {
        .desktop__icon-grid {
            grid-row-gap: 0.7rem;
            grid-template-columns: 7rem;
            grid-template-rows: repeat(3, 7rem); 
        }
    }
    @media only screen and (max-width: 56.25em) {
        .desktop__icon-grid {
            grid-row-gap: 0.9rem;
            grid-template-columns: 8rem;
            grid-template-rows: repeat(3, 8rem);
        }
    }
    @media only screen and (max-width: 37.5em) {
        .desktop__icon-grid {
            grid-row-gap: 1.2rem;
            grid-template-columns: 9rem;
            grid-template-rows: repeat(3, 9rem); 
        } 
    }

    .shortcut {
        user-select: none;
        display: flex;
        flex-direction: column;
        align-items: center;

        img {
            margin-bottom: 0.3rem;
        }

        span {
            background-color: black;
            color: white;
            padding: 0 0.2rem;
            text-align: center;
        }

        @media only screen and (max-width: 75em) {
            .desktop__icon-grid .shortcut {
                font-size: 1.1rem;
            }
        }
        @media only screen and (max-width: 56.25em) {
            .desktop__icon-grid .shortcut {
                font-size: 1.25rem;
            }
        }
        @media only screen and (max-width: 37.5em) {
            .desktop__icon-grid .shortcut {
                font-size: 1.4rem; 
            } 
        }
    }
}
</style>

<div class="desktop__icon-grid">
    <div class="shortcut">
        <img src="../public/assets/icons/ico2.gif" alt="Terminal">
        <span>Terminal</span>
    </div>
    <div class="shortcut">
        <img src="../public/assets/icons/ico3.gif" alt="Mail">
        <span>Mail</span>
    </div>
    <div class="shortcut">
        <img src="../public/assets/icons/ico5.gif" alt="Home">
        <span>Home</span>
    </div>
</div>