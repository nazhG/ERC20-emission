<script>
	const BRONCE = 50,
	SILVER = 100,
	GOLD = 250,
	PLATINUM = 500,
	TOKEN_SIMBOL = 'USDC',
	REWARD_SIMBOL = 'TVP';
</script>

<main>
	<div class="head-bar">
		<img class="logo" src=".\img\terra.png" alt="Terra Logo">
		<span>Prestige Points</span>
		<button class="btn-connect">Connect</button>
	</div>
	<br>
	<h1>Join tiers to earn <i>Rewards</i>.</h1>
	<div class="medals-bar">
		<div class="bronze-bg">
			<h2>Bronze</h2>
			<div class="bronce shine">
				<img src=".\img\bronce.jpg" alt="bronce">
				<span></span>
			</div>
			<button class="tooltip">
				{ BRONCE } {TOKEN_SIMBOL}
				<span class="tooltiptext">
					Join tier <i>!!</i><br>
					Min Reward per day { BRONCE * 0.1 } { REWARD_SIMBOL }
				</span>
			</button>
		</div>
		<div class="silver-bg">
			<h2>Silver</h2>
			<div class="silver shine">
				<img src=".\img\silver.jpg" alt="silver">
				<span></span>
			</div>
			<button class="tooltip">
				{ SILVER } {TOKEN_SIMBOL}
				<span class="tooltiptext">
					Join tier <i>!!</i><br>
					Min Reward per day { SILVER * 0.1 } { REWARD_SIMBOL }
				</span>
			</button>
		</div>
		<div class="gold-bg">
			<h2>Gold</h2>
			<div class="gold shine">
				<img src=".\img\gold.jpg" alt="gold">
				<span></span>
			</div>
			<button class="tooltip">
				{ GOLD } {TOKEN_SIMBOL}
				<span class="tooltiptext">
					Join tier <i>!!</i><br>
					Min Reward per day { GOLD * 0.1 } { REWARD_SIMBOL }
				</span>
			</button>
		</div>
		<div class="platinum-bg">
			<h2>Platinum</h2>
			<div class="platinum shine">
				<img src=".\img\platinum.jpg" alt="platinum">
				<span></span>
			</div>
			<button class="tooltip">
				{ PLATINUM } {TOKEN_SIMBOL}
				<span class="tooltiptext">
					Join tier <i>!!</i><br>
					Min Reward per day { PLATINUM * 0.1 } { REWARD_SIMBOL }
				</span>
			</button>
		</div>
	</div>
	<p>
		Invest to get a daily reward token, or hold it to get the max multiplier <i>!</i><br>
		connect your wallet and start earning <i>Prestige Token</i> changebles for a NFT Reward in <a href="https://terravirtua.io/marketplace">Terra virtua</a>.
	</p>
	<footer>
		<p>&copy; Copyright 2021.</p>
	</footer>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	.head-bar {
		background-color: #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30px;
		border-radius: 4px;
	}

	.head-bar span {
		font-size: 2.5rem;
		font-weight: bold;
	}

	button {
		border-radius: 50px;
		background-color: white;
		box-shadow: 2px 2px 15px 2px #ddd;
		padding: 15px;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.logo {
		width: 4em;
	}

	.medals-bar {
		display: flex;
    	justify-content: space-around;
	}

	.medals-bar>div {
		width:20%;
		padding: 1em;
		border: 1px solid #eee;
		border-radius: 4px;
		margin: 0.2em;
	}

	.bronze-bg {
		background-color: #be5a2829;
	}

	.silver-bg {
		background-color: #b8bfc729;
	}

	.gold-bg {
		background-color: #f6dc6e30;
	}

	.platinum-bg {
		background-color: #d03b8b29;
	}

	.medals-bar img {
		width: 100%;
    	border-radius: 50%;
	}

	.shine {
		position: relative;
	}

	.medals-bar button{
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

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>