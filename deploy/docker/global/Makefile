up:
	docker compose -f docker-compose.pg.yml up -d
	docker compose -f docker-compose.llm.yml up -d

down:
	docker compose -f docker-compose.llm.yml down
	docker compose -f docker-compose.pg.yml down


test_mineru-ascend:
	curl --location --request POST http://127.0.0.1:6007/v2/parse/file --header "Authorization" --form "file=@/mnt/c/Users/Administrator/Downloads/中国光伏行业协会-我国光伏行业发展形势分析.pdf"
