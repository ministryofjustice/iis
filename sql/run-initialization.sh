#!/bin/bash
set -e

sleep 15

echo "Creating DB"

cat ./schema/000_prepare_db_schema_and_users.sql \
    | sed  "s/{iisuser_password}/'${IIS_USER_PASSWORD}'/g" \
    | /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -d master -r0  > /dev/null

for filename in ./schema/*.sql; do
    if [[ "$filename" != ./schema/000_* ]]
    then
        echo "Running schema $filename"
        /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -d iis -i $filename -r0  > /dev/null   
    fi
done

for filename in ./seed/*.sql; do
    echo "Running seed file $filename"
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -d iis -i $filename -r0  > /dev/null 
done

for filename in ./migration/*.sql; do
    echo "Running migration $filename"
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -d iis -i $filename -r0  > /dev/null   
done


echo "FIN!"
