<script>
    export let tier_name, join_cost, reward_token_symbol, pay_token_symbol;
</script>

<div class="tier { tier_name }">
    <h2>{ tier_name }</h2>
    <div class="shine">
        <img src=".\img\{ tier_name }.jpg" alt="{ tier_name }">
        <span></span>
    </div>
    <button class="btn tooltip">
        { join_cost } { pay_token_symbol }
        <span class="tooltiptext">
            Join tier <i>!!</i><br>
            Daily minimum reward { join_cost * 0.1 } { reward_token_symbol }
        </span>
    </button>
</div>

<style>
    
	.tier {
		width:20%;
		padding: 1em;
		border: 1px solid #eee;
		border-radius: 4px;
		margin: 0.2em;
	}

	.Bronze {
		background-color: #be5a2829;
	}

	.Silver {
		background-color: #b8bfc729;
	}

	.Gold {
		background-color: #f6dc6e30;
	}

	.Platinum {
		background-color: #d03b8b29;
	}

	img {
		width: 100%;
    	border-radius: 50%;
	}

	.shine {
		position: relative;
	}

	button{
		margin-block-start: 0.83em;
	}

	.shine span{
		position: absolute;
		display: block;
		top: 0;
		background: url(../img/shine.png) no-repeat;
		background-position: 300% 0px;
		height: 100%;
		width: 100%;
		background-size: cover;
		border-radius: 50%;
	}

	.shine:hover span{
		background-position: 300px 0px;
		-webkit-transition-property: all;
		-webkit-transition-duration: 1.5s;
		transition-property: all;
		opacity: 0.1;
		transition-duration: 1.5s;
	}

</style>