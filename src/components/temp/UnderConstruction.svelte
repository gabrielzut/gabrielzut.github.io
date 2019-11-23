<style type="text/scss">
.uc {
    width: 20rem;
    margin: 5rem auto;
    user-select: none;
}

.under-construction {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 15rem;

    img {
        margin-bottom: 1rem;
    }
}

.window {
    background-color: #d6d3a7;
    border-left: 0.2rem solid #c7c7c7;
    border-top: 0.2rem solid #c7c7c7;
    border-right: 0.2rem solid #7b7b7b;
    border-bottom: 0.2rem solid #7b7b7b;
    position: relative;
    padding-top: 2rem;

    &__title {
        flex: 1;
        background: rgb(0,80,69);
        background: linear-gradient(90deg, rgba(0,80,69,1) 0%, rgba(0,0,0,1) 100%);
        display: flex;
        align-items: center;
        color: white;
        padding-left: 1rem;
    }

    &__header {
        width: 100%;
        position: absolute;
        top: 0;
        height: 2rem;
        min-height: 20px;
        display: flex;
        justify-content: end;
    }

    &__button {
        background-color: #d6d3a7;
        border-left: 0.2rem solid #c7c7c7;
        border-top: 0.2rem solid #c7c7c7;
        border-right: 0.2rem solid #7b7b7b;
        border-bottom: 0.2rem solid #7b7b7b;
        height: 100%;
        width: 2rem;
        min-width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;

        &:active {
            border-right: 0.2rem solid #c7c7c7;
            border-bottom: 0.2rem solid #c7c7c7;
            border-left: 0.2rem solid #7b7b7b;
            border-top: 0.2rem solid #7b7b7b;
            background-size: 2px 2px;
            background-color: #8c8c8c;
        }
    }
}
</style>

<div class="window uc">
    <div class="window__header">
        <div class="window__title">
            Important
        </div>
        <button class="window__button"><img src="../public/assets/icons/window_ico2.gif" alt="Minimize window" /></button>
        <button class="window__button"><img src="../public/assets/icons/window_ico2.gif" style="transform: scaleY(-1);" alt="Maximize window" /></button>
        <button class="window__button"><img src="../public/assets/icons/window_ico1.gif" alt="Close window" /></button>
    </div>
    <div class="under-construction">
        <img src="../public/assets/icons/ico6.gif" alt="Warning sign">
        Under construction
    </div>
</div>