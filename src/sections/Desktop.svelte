<script>
    import IconGrid from "../components/desktop/IconGrid.svelte";
    import UnderConstruction from "../components/temp/UnderConstruction.svelte";
    import Taskbar from "../components/common/Taskbar.svelte";
</script>

<style type="text/scss">
    .desktop {
        padding-top: 1rem;
        position: relative;
        height: 100vh;
        width: 100%;
        background: rgb(0,36,31);
        background: linear-gradient(0deg, rgba(0,36,31,1) 0%, rgba(9,83,121,1) 100%);

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
    }
</style>

<div class="desktop section">
    <IconGrid />
    <UnderConstruction />
    <Taskbar />
</div>